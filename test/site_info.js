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
    it('should call the error callback if the url is blank or null', function(){
      var cb = sinon.spy();

      var result = so('', cb, function(){} );

      expect( cb.called ).toBe(true);
    });

    it('should call the error call back if the page does not exist', function(){

      var result = so('http://www.google.com/jhkskjsdf', function(e){
        expect( false ).toBe(true);
      }, function(d){
        console.log("SUCC!");
        console.log(d);
      });
      
    });
  });
});