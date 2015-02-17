# img64

Replace image sources with base64 encoded data strings.

## Getting Started
Install the module with: `npm install img64`

```javascript
var img64 = require('img64');
img64.encodeImgs(string, function(err, string) {
  // this string has all img src values base64 encoded.
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
* 0.3.1 - Update dependencies for node v0.12 support.
* 0.3.0 - Remove jQuery and underscore as dependencies.
* 0.2.3 - Update node-jquery.
* 0.2.2 - Update grunt.
* 0.2.1 - Use node-jquery rather than a remotely hosted version.
* 0.2.0 - Code refactoring, and simple support for local files.

## License
Copyright (c) 2012 Elliott Foster
Licensed under the MIT license.

