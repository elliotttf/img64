/**
 * img64
 * https://github.com/elliotttf/img64
 *
 * Copyright (c) 2012 Elliott Foster
 * Licensed under the MIT license.
 */

var jsdom = require('jsdom');
var request = require('request');
var url = require('url');

module.exports = (function() {
  var fetchRemoteImg = function(src, callback) {
    var options = {
      uri: url.parse(src),
      encoding: 'binary'
    };
    request(options, function(err, res, body) {
      if (err) {
        callback(err, null);
        return;
      }
      else if (res.statusCode !== 200) {
        callback(res.statusCode, null);
        return;
      }

      var buf = new Buffer(body, 'binary');
      var data = 'data:' + res.headers['content-type'] + ';base64,' + buf.toString('base64');
      callback(null, data);
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

          if (imgsToConvert === 0) {
            callback(null, $('#img64-wrapper').html());
            return;
          }

          $('img').each(function() {
            var self = this;
            // Fetch the source image and convert it to a base64 string.
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

