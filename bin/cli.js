#!/usr/bin/env node

var siteinfo = require('../siteinfo');
var url = process.argv[2];

if (!url) {
  console.log('Must pass in url');
  process.exit(1);
}

siteinfo(url,
         function(err) {
           console.log('ERROR');
           console.log(err);
         },
         function(data) {
           Object.keys(data).forEach(function(key) {
             var value = data[key];
             if (value instanceof Array) {
               value = value.join('\n');
             }
             console.log(key + ': ' + value);
           });
         }
        );
