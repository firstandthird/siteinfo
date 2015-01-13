var expect = require('expect');
var sinon = require('sinon');

var server = require('./helpers/test_server.js');

var so = require('../siteinfo');

describe('SiteInfo', function() {
  describe('#()', function() {
    it('should return an object upon instantiation', function() {
      var result = so('', function() {}, function() {});
      expect(result).toBeA('object');
      var keys = Object.keys( result );
    });
  });

  describe('#get_page', function() {
    before(function(done) {
      server.listen(3070, done);
    });

    after(function() {
      server.close();
    });

    it('should call the error callback if the url is blank or null', function() {
      var errCb = sinon.spy();
      var result = so('', errCb, function() {} );
      expect( errCb.called ).toBe(true);
    });

    it('should call the error call back if the page does not exist', function(done) {
      var result = so('http://localhost:3070/jhkkjhdfg', function(e) {
        expect( true ).toBe(true);
        expect(e).toBeA('object');
        done();
      }, function() {
        expect( false ).toBe(true);
        done();
      } );
    });

    it('should call the success callback for a page that does exist', function(done) {
      var result = so('http://localhost:3070', function(e) {
        throw(e);
        done();
      }, function(d) {
        expect(d).toBeA('object');
        done();
      });
    });

    it('should have the correct keys in the return data object', function(done) {
      var result = so('http://localhost:3070', function(e) {
        throw(e);
        done();
      }, function(d) {
        expect(d).toBeA('object');
        keys = Object.keys(d);
        expect(keys).toEqual(['pageTitle', 'description', 'descriptionSource', 'presumedFavicon', 'favicon', 'mainImage', 'images']);
        done();
      });
    });

    it('should find the description of the meta tag', function(done){
      var result = so('http://localhost:3070', function(e, d) {
        if( e === false)
        {
          throw(e);
          done();
          return;
        }
        
        expect(d.description).toEqual('This is a meta description.');
        done();
      });
    });

  });
});