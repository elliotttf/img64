/**
 * img64
 * https://github.com/elliotttf/img64
 *
 * Copyright (c) 2012 Elliott Foster
 * Licensed under the MIT license.
 */

var fs = require('fs');
var jsdom = require('jsdom');
var request = require('request');
var url = require('url');
var path = require('path');
var Promise = require('node-promise').Promise;
var mime = require('mime');

module.exports = (function() {

  var _encodeLocalImg = function(src, promise) {
    fs.readFile(src, 'base64', function fileRead(err, data) {
      if (err) {
        promise.reject(err);
        return;
      }

      data = 'data:' + mime.lookup(src) + ';base64,' + data;
      promise.resolve(data);
    });
  };

  var encodeLocalImg = function(src, opts, promise) {
    if (typeof opts === 'function') {
      promise = opts;
      opts = {};
    }

    var loc = src;

    loc = path.join((opts.baseDir || __dirname), src);

    fs.exists(loc, function(exists) {
      // Couldn't find or read the file, if we have a base URI to work
      // with try to fetch it remotely.
      if (!exists && typeof opts.serverURI !== 'undefined') {
        encodeRemoteImg(url.resolve(opts.serverURI, src), opts, promise);
        return;
      }
      else if (!exists) {
        promise.reject('File does not exist or is not readable.');
        return;
      }

      _encodeLocalImg(loc, promise);
    });
  };

  var encodeRemoteImg = function(src, opts, promise) {
    if (typeof opts === 'function') {
      promise = opts;
      opts = {};
    }

    var options = {
      uri: url.parse(src),
      encoding: 'binary'
    };
    request(options, function(err, res, body) {
      if (res.statusCode !== 200) {
        promise.reject(res.statusCode);
        return;
      }

      var buf = new Buffer(body, 'binary');
      var data = 'data:' + res.headers['content-type'] + ';base64,' + buf.toString('base64');
      promise.resolve(data);
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
        [],
        function documentOpened(errors, window) {
          if (errors) {
            callback(errors, doc);
            return;
          }

          var imgs = window.document.getElementsByTagName('img');
          var convertedImgs = 0;
          var imgsToConvert = imgs.length;
          var errs = [];
          var rExternal = /^(http|\/\/)/;
          var rData = /^data:/;

          var encodedImg = function(err, elem, src) {
            convertedImgs++;
            if (err) {
              errs.push(err);
            }
            else {
              elem.setAttribute('src', src);
            }
            if (convertedImgs === imgsToConvert) {
              var errors = errs.length ? errs : null;
              callback(errors, window.document.getElementById('img64-wrapper').innerHTML);
            }
          };

          var handlePromise = function(p, x) {
            p.then(
              function(src) {
                encodedImg(null, imgs[x], src);
              },
              function(err) {
                encodedImg(err, imgs[x], null);
              }
            );
          };

          if (imgsToConvert === 0) {
            callback(null, window.document.getElementById('img64-wrapper').innerHTML);
            return;
          }

          for (var x = 0; x < imgs.length; x++) {
            // Fetch the source image and convert it to a base64 string.
            var img = imgs[x];
            var imgSrc = img.getAttribute('src');

            if (rData.test(imgSrc)) {
              encodedImg(null, img, imgSrc);
              continue;
            }

            var p = new Promise();
            if (!rExternal.test(imgSrc)) {
              encodeLocalImg(imgSrc, opts, p);
            }
            else {
              encodeRemoteImg(imgSrc, opts, p);
            }
            handlePromise(p, x);
          }
        }
      );
    }
  };
}());

