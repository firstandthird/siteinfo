
var http = require('http');

var server = module.exports = http.createServer(function (req, res) {
  if(req.url === '/')
  {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('<html><head><title>This is a test.</title></head><body><img src="/thugsaretripping.jpg" /></body></html>');
  } else {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end('<html><head><title>This is a test.</title></head><body><h1>ERRR!</h1></body></html>');
  }

});