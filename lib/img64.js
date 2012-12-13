/**
 * img64
 * https://github.com/elliotttf/img64
 *
 * Copyright (c) 2012 Elliott Foster
 * Licensed under the MIT license.
 */

var fs = require('fs');
var http = require('http');
var jsdom = require('jsdom');
var url = require('url');
var path = require('path');
var mime = require('mime');
var _ = require('underscore');

module.exports = (function() {

  var _encodeLocalImg = function(src, callback) {
    fs.readFile(src, 'base64', function fileRead(err, data) {
      if (err) {
        callback(err, null);
        return;
      }

      data = 'data:' + mime.lookup(src) + ';base64,' + data;
      callback(null, data);
    });
  };

  var encodeLocalImg = function(src, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    var loc = src;

    loc = path.join((opts.baseDir || __dirname), src);

    fs.exists(loc, function(exists) {
      // Couldn't find or read the file, if we have a base URI to work
      // with try to fetch it remotely.
      if (!exists && typeof opts.serverURI !== 'undefined') {
        encodeRemoteImg(url.resolve(opts.serverURI, src), opts, callback);
        return;
      }
      else if (!exists) {
        callback('File does not exist or is not readable.', null);
        return;
      }

      _encodeLocalImg(loc, callback);
    });
  };

  var encodeRemoteImg = function(src, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    var options = url.parse(src);
    var req = http.get(options, function(res) {
      if (res.statusCode !== 200) {
        callback(res.statusCode, null);
        return;
      }

      res.setEncoding('binary');
      var data = '';
      res.on('data', function(chunk) {
        data += chunk;
      });

      res.on('end', function() {
        var buf = new Buffer(data, 'binary');
        data = 'data:' + res.headers['content-type'] + ';base64,' + buf.toString('base64');
        callback(null, data);
      });
    });
  };

  return {
    /**
     * Converts image sources to base64 encoded images.
     *
     * @param {object} opts
     *   (optional) A hash of options to use when encoding images.
     *   The following are valid options:
     *     {string} baseDir
     *       A path to the base directory to look for local files in.
     *     {string} serverURI
     *       A server URI to use for relative filepaths.
     * @param {function} callback
     *   The function to execute when all images have been encoded.
     *   Receives an array of errors or null, and the document to convert.
     *   If there were errors this function makes a "best effort" to convert
     *   sources and may return a partially converted document.
     */
    encodeImgs: function(doc, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }

      // Wrap the string in a div so jsdom doesn't freak out if
      // there's no HTML in the original string.
      doc = '<div id="img64-wrapper">' + doc + '</div>';
      jsdom.env(
        doc,
        [ 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js' ], // TODO - let's not rely on this.
        function documentOpened(errors, window) {
          if (errors) {
            callback(errors, doc);
            return;
          }

          var $ = window.jQuery;
          var convertedImgs = 0;
          var imgsToConvert = $('img').length;
          var errs = [];
          var rExternal = /^(http|\/\/)/;
          var rData = /^data:/;

          var encodedImg = function(err, string) {
            convertedImgs++;
            if (err) {
              errs.push(err);
            }
            else {
              $(this).attr('src', string);
            }
            if (convertedImgs === imgsToConvert) {
              var errors = errs.length ? errs : null;
              callback(errors, $('#img64-wrapper').html());
            }
          };

          if (imgsToConvert === 0) {
            callback(null, $('#img64-wrapper').html());
            return;
          }

          $('img').each(function() {
            // Fetch the source image and convert it to a base64 string.
            var img = $(this).attr('src');
            var _encodedImg = _.bind(encodedImg, this);

            if (rData.test(img)) {
              _encodedImg(null, img);
            }
            else if (!rExternal.test(img)) {
              encodeLocalImg(img, opts, _encodedImg);
            }
            else {
              encodeRemoteImg(img, opts, _encodedImg);
            }
          });
        }
      );
    }
  };
}());

