/**
 * img64
 * https://github.com/elliotttf/img64
 *
 * Copyright (c) 2012 Elliott Foster
 * Licensed under the MIT license.
 */

var http = require('http');
var jsdom = require('jsdom');
var url = require('url');
var path = require('path');

module.exports = (function() {
  var encodeLocalImg = function(src, opts, callback) {
    var opts = opts || {};

    // Shift args if no options object is specified
    if (utils.kindOf(opts) === "function") {
      done = opts;
      opts = {};
    }

    var loc = img;

    loc == src.charAt(0) === "/" ?
      (opts.baseDir || "") + loc :
      path.join(path.dirname(srcFile), img);

    if (!fs.existsSync(loc)) {
      loc = path.resolve(__dirname + img);
    }

    if (!fs.existsSync(loc)) {
      grunt.fail.warn("File " + img + " does not exist");
      complete(null, img, false);
      return;
    }
  }
  var encodeRemoteImg = function(src, callback) {
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
    convertRemoteImgs: function(doc, callback) {
      doc = '<div id="img64-wrapper">' + doc + '</div>';
      jsdom.env(
        doc,
        [ 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js' ],
        function documentOpened(errors, window) {
          if (errors) {
            callback(errors, doc);
            return;
          }

          var $ = window.jQuery;
          var convertedImgs = 0;
          var imgsToConvert = $('img').length;
          var errs = [];

          var rExternal = /^http/;

          if (imgsToConvert === 0) {
            callback(null, $('#img64-wrapper').html());
            return;
          }

          $('img').each(function() {
            var self = this;
            // Fetch the source image and convert it to a base64 string.
            var img = $(self).attr('src');
            
            if (rExternal.test(img) {
              encodeLocalImg(
            }

            fetchRemoteImg($(self).attr('src'), function fetchedRemoteImg(err, string) {
              convertedImgs++;
              if (err) {
                errs.push(err);
              }
              else {
                $(self).attr('src', string);
              }

              if (convertedImgs === imgsToConvert) {
                var errors = errs.length ? errs : null;
                callback(errors, $('#img64-wrapper').html());
              }
            });
          });
        }
      );
    }
  };
}());

