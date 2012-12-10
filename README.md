# img64

Replace image sources with base64 encoded data strings.

## Getting Started
Install the module with: `npm install img64`

```javascript
var img64 = require('img64');
img64.convertRemoteImages(string, function(err, string) {
  // this string has all img src values base64 encoded.
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Elliott Foster
Licensed under the MIT license.
