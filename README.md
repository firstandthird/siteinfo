# SiteInfo Module

[![Build Status](https://travis-ci.org/firstandthird/siteinfo.svg?branch=master)](https://travis-ci.org/firstandthird/siteinfo)
[![Coverage Status](https://coveralls.io/repos/github/firstandthird/siteinfo/badge.svg?branch=master)](https://coveralls.io/github/firstandthird/siteinfo?branch=master)

## Usage

Use the module by requiring it into your scope, then sending the url, and the callbacks to the function.

```javascript
var SiteInfo = require('siteinfo');
new SiteInfo({
  url: 'https://google.com'
}, cb);
```
