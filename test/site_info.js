var expect = require("expect");
var sinon = require("sinon");

var server = require('./helpers/test_server.js');

var so = require('../siteinfo');

describe('SiteInfo', function(){
  describe('#()',function(){
    
    it('should return an object upon instantiation', function(){
      var result = so('', function(){}, function(){});
      expect(result).toBeA('object');
      var keys = Object.keys( result );
    });
  });

  describe('#get_page', function(){

    before(function(done){
      server.listen(3070, done);
    });

    after(function(){
      server.close();
    });

    it('should call the error callback if the url is blank or null', function(){
      var err_cb = sinon.spy();
      var result = so('', err_cb, function(){} );
      expect( err_cb.called ).toBe(true);
    });

    it('should call the error call back if the page does not exist', function(done){
      var err_cb = sinon.spy();
      var result = so('http://www.google.com/jhkkjhdfg', function(e){
        expect( true ).toBe(true);
        expect(e).toBeA('object');
        done();
      }, function(){} );
    });
  });
});