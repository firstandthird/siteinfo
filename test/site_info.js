/* eslint max-len: 0, no-console: 0, no-unused-vars: 0 */
'use strict';

const sinon = require('sinon');
const Hoek = require('hoek');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const server = require('./helpers/test_server.js');

const UrlInfo = require('../');

lab.experiment('UrlInfo', () => {
  lab.experiment('#()', () => {
    lab.test.skip('should return an object upon instantiation', done => {
      const result = new UrlInfo({}, () => {});

      Hoek.assert(typeof result === 'object', 'Returned data not an object');

      const keys = Object.keys(result);

      console.log(keys);

      Hoek.assert(Hoek.deepEqual(keys, ['options', 'url', 'urlObject', 'cb', 'data']), 'Keys dont match');
      done();
    });
  });

  lab.experiment('Basic', () => {
    lab.before(done => {
      server.listen(3070, done);
    });

    lab.after(done => {
      server.close();
      done();
    });

    lab.test('should call the error callback if the url is blank or null', done => {
      const errCb = sinon.spy();
      const result = new UrlInfo({}, errCb);

      Hoek.assert(errCb.args[0][0] !== null, 'Error not triggered');

      done();
    });

    lab.test('should set the err argument to an error object message if the page does not exist', done => {
      const result = new UrlInfo({ url: 'http://localhost:3070/jhkkjhdfg' }, (e, d) => {
        Hoek.assert(typeof e === 'object', 'Error not returned');
        done();
      });
    });

    lab.test('should set err to null if the page exists.', done => {
      const result = new UrlInfo({ url: 'http://localhost:3070' }, (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        done();
      });
    });

    lab.test('should have the correct keys in the return data object', done => {
      const result = new UrlInfo({ url: 'http://localhost:3070' }, (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(typeof d === 'object', 'Data not returned');
        const keys = Object.keys(d);
        Hoek.assert(Hoek.deepEqual(keys, ['pageTitle', 'description', 'descriptionSource', 'presumedFavicon', 'favicon', 'mainImage', 'images']));
        done();
      });
    });

    lab.test('should find the description of the meta tag', done => {
      const result = new UrlInfo({ url: 'http://localhost:3070' }, (e, d) => {
        Hoek.assert(e === null, 'Error returned');

        Hoek.assert(d.description === 'This is a meta description.');
        done();
      });
    });

    lab.test('should prefix images with the correct TLD URL', done => {
      const result = new UrlInfo({ url: 'http://localhost:3070/subfolder/test_2.html' }, (e, d) => {
        Hoek.assert(e === null, 'Error returned');

        const tldImage = d.images[0];
        Hoek.assert(tldImage.match(/http:\/\/cdn\.example\.com\/images\/thugsaretripping\.jpg/) !== null, 'No match');

        const nonTLDImage = d.images[1];
        Hoek.assert(nonTLDImage.match(/http:\/\/localhost:3070\/images\/thugsaretripping\.jpg/) !== null, 'No match');

        const subFolderImage = d.images[2];
        Hoek.assert(subFolderImage.match(/http:\/\/localhost:3070\/subfolder\/sub-images\/thugsaretripping\.jpg/) !== null, 'No match');
        done();
      });
    });
  });

  lab.experiment('Youtube', () => {
    // TODO: Test basic parser fallback
    // TODO: Test invalid video id (private or removed video)
    lab.test.skip('should parse a youtube url correctly', done => {
      const result = new UrlInfo({
        url: 'https://www.youtube.com/watch?v=dK2b4CbICYo',
        youtube: {
          key: 'AIzaSyDIsWi2OcnBSHctD6XfD0kwsyNa39G0ON4'
        }
      }, (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(d.parser === 'youtube', 'Youtube parser not used');
        done();
      });
    });

    lab.test.skip('should parse a short youtube url correctly', done => {
      const result = new UrlInfo({
        url: 'http://youtu.be/dK2b4CbICYo',
        youtube: {
          key: 'AIzaSyDIsWi2OcnBSHctD6XfD0kwsyNa39G0ON4'
        }
      }, (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(d.parser === 'youtube', 'Youtube parser not used');
        done();
      });
    });
  });

  lab.experiment('Twitter', () => {
    // TODO: Test fallback parser
    // TODO: Test tweet not found
    lab.test.skip('should parse a twitter url correctly', done => {
      const result = new UrlInfo({
        url: 'https://twitter.com/LaughingSquid/status/702524296065847296',
        twitter: {
          key: 'PPswHRM94UNBlNxpRzQd1NZG5',
          secret: '8CTYTayeFOdaqZ3lslGgY6DSXO7Q98zEcGO0KVxEQuuRCNfrxW'
        }
      }, (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(d.parser === 'twitter', 'Twitter parser not used');
        done();
      });
    });
  });

  lab.experiment('Facebook', () => {
    // TODO: Test photo url
    // TODO: Test fallback parser
    // TODO: Test post not found
    lab.test.skip('should parse a facebook post url correctly', done => {
      const result = new UrlInfo({
        url: 'https://www.facebook.com/Bones/posts/10154050815309497',
        facebook: {
          token: '193676364331885|TDKyNF1xWb3uXlxnH2NxxgXCODQ'
        }
      }, (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(d.parser === 'facebook', 'Facebook parser not used');
        done();
      });
    });
  });

  lab.experiment('Instagram', () => {
    // TODO: Test fallback parser
    // TODO: Test post not found
    // TODO: Test video post
    lab.test.skip('should parse an instagram post url correctly', done => {
      const result = new UrlInfo({
        url: 'https://www.instagram.com/p/dpbIsZhOvT/',
        instagram: {
          token: '373385313.01658df.cb6eca695b8346dfb82d2b1bafd8ac38'
        }
      }, (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(d.parser === 'instagram', 'Instagram parser not used');
        done();
      });
    });
  });

  lab.experiment('Vimeo', () => {
    // TODO: Test fallback parser
    // TODO: Test post not found
    // TODO: Test channel video page
    lab.test.skip('should parse a vimeo url correctly', done => {
      const result = new UrlInfo({
        url: 'https://vimeo.com/156455111'
      }, (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(d.parser === 'vimeo', 'Vimeo parser not used');
        done();
      });
    });
  });
});
