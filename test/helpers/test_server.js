
var http = require('http');

var server = module.exports = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<html><head><title>This is a test.</title></head><body></body><img src="/thugsaretripping.jpg" /></html>');
});