
var http = require('http');

var server = module.exports = http.createServer( function(req, res) {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><head><title>This is a test.</title><meta name="description" content="This is a meta description."></meta></head><body><img src="/thugsaretripping.jpg" /></body></html>');
  } else if( req.url === '/subfolder/test_2.html' ) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><head><title>This is a test.</title><meta property="og:description" content="og property description"></meta><meta name="description" content="regular description"></meta></head><body><img src="http://cdn.example.com/images/thugsaretripping.jpg" /><img src="/images/thugsaretripping.jpg" /><img src="sub-images/thugsaretripping.jpg" /></body></html>');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<html><head><title>This is a test.</title></head><body><h1>ERRR!</h1></body></html>');
  }

});