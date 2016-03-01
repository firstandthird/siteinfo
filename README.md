# urlinfo Module

[![Build Status](https://travis-ci.org/firstandthird/urlinfo.svg?branch=master)](https://travis-ci.org/firstandthird/urlinfo)
[![Coverage Status](https://coveralls.io/repos/github/firstandthird/urlinfo/badge.svg?branch=master)](https://coveralls.io/github/firstandthird/urlinfo?branch=master)

## Usage

Use the module by requiring it into your scope, then sending the url, and the callbacks to the function.

```javascript
var UrlInfo = require('urlinfo');
new UrlInfo({
  url: 'https://google.com'
}, cb);
```
