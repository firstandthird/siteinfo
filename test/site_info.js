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
      expect(keys).toEqual(["urlObject","url","cb"]);
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
      var result = so('', errCb );
      expect( errCb.called ).toBe(true);
    });

    it('should set the err argument to an error object message if the page does not exist', function(done) {
      var result = so('http://localhost:3070/jhkkjhdfg', function(e, d) {
        expect( d ).toBe(false);
        expect(e).toBeA('object');
        done();
      });
    });

    it('should set err to false if the page exists.', function(done) {
      var result = so('http://localhost:3070', function(e, d) {
        if(e !== false)
        {
          throw(e);
          done();
        }

        expect(e).toBe(false);
        done();
      });
    });

    it('should have the correct keys in the return data object', function(done) {
      var result = so('http://localhost:3070', function(e, d) {
        expect(d).toBeA('object');
        keys = Object.keys(d);
        expect(keys).toEqual(['pageTitle', 'description', 'descriptionSource', 'presumedFavicon', 'favicon', 'mainImage', 'images']);
        done();
      });
    });

    it('should find the description of the meta tag', function(done){
      var result = so('http://localhost:3070', function(e, d) {
        if( e !== false)
        {
          throw(e);
          done();
        }
        
        expect(d.description).toEqual('This is a meta description.');
        done();
      });
    });

    it('should prefix images with the correct TLD URL', function(done) {
      var result = so('http://localhost:3070/subfolder/test_2.html', function(e, d) {
        if( e !== false)
        {
          throw(e);
          done();
          return;
        }

        tldImage = d.images[0];
        expect( tldImage ).toMatch(/http:\/\/cdn\.example\.com\/images\/thugsaretripping\.jpg/);

        nonTLDImage = d.images[1];
        expect( nonTLDImage ).toMatch(/http:\/\/localhost:3070\/images\/thugsaretripping\.jpg/);

        subFolderImage = d.images[2];
        expect( subFolderImage ).toMatch(/http:\/\/localhost:3070\/subfolder\/sub-images\/thugsaretripping\.jpg/);
        done();
      });
    });

  });
});