/* eslint max-len: 0, no-console: 0, no-unused-vars: 0, strict: 0*/
'use strict';

const sinon = require('sinon');
const Hoek = require('hoek');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

const server = require('./helpers/test_server.js');

const UrlInfo = require('../');

lab.experiment('UrlInfo', () => {
  lab.experiment('#()', () => {
    lab.test('should return an object upon instantiation', done => {
      const urlinfo = new UrlInfo({});
      const result = urlinfo.parse('', () => {});

      Hoek.assert(typeof result === 'object', 'Returned data not an object');

      const keys = Object.keys(result);

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
      const urlinfo = new UrlInfo({});
      const result = urlinfo.parse('', errCb);

      Hoek.assert(errCb.args[0][0] !== null, 'Error not triggered');

      done();
    });

    lab.test('should set the err argument to an error object message if the page does not exist', done => {
      const urlinfo = new UrlInfo({});
      const result = urlinfo.parse('http://localhost:3070/jhkkjhdfg', (e, d) => {
        Hoek.assert(typeof e === 'object', 'Error not returned');
        done();
      });
    });

    lab.test('should set err to null if the page exists.', done => {
      const urlinfo = new UrlInfo({});
      const result = urlinfo.parse('http://localhost:3070', (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        done();
      });
    });

    lab.test('should have the correct keys in the return data object', done => {
      const urlinfo = new UrlInfo({});
      const result = urlinfo.parse('http://localhost:3070', (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(typeof d === 'object', 'Data not returned');
        const keys = Object.keys(d);
        Hoek.assert(Hoek.deepEqual(keys, ['pageTitle', 'description', 'descriptionSource', 'presumedFavicon', 'favicon', 'mainImage', 'images']));
        done();
      });
    });

    lab.test('should find the description of the meta tag', done => {
      const urlinfo = new UrlInfo({});
      const result = urlinfo.parse('http://localhost:3070', (e, d) => {
        Hoek.assert(e === null, 'Error returned');

        Hoek.assert(d.description === 'This is a meta description.');
        done();
      });
    });

    lab.test('should prefix images with the correct TLD URL', done => {
      const urlinfo = new UrlInfo({});
      const result = urlinfo.parse('http://localhost:3070/subfolder/test_2.html', (e, d) => {
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
    lab.test('should parse a youtube url correctly', done => {
      const urlinfo = new UrlInfo({
        youtube: {
          key: 'AIzaSyDIsWi2OcnBSHctD6XfD0kwsyNa39G0ON4'
        }
      });
      const result = urlinfo.parse('https://www.youtube.com/watch?v=dK2b4CbICYo', (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(d.parser === 'youtube', 'Youtube parser not used');
        done();
      });
    });

    lab.test('should parse a short youtube url correctly', done => {
      const urlinfo = new UrlInfo({
        youtube: {
          key: 'AIzaSyDIsWi2OcnBSHctD6XfD0kwsyNa39G0ON4'
        }
      });
      const result = urlinfo.parse('http://youtu.be/dK2b4CbICYo', (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(d.parser === 'youtube', 'Youtube parser not used');
        done();
      });
    });
  });

  lab.experiment('Twitter', () => {
    // TODO: Test fallback parser
    lab.test('should parse a twitter url correctly', done => {
      const urlinfo = new UrlInfo({
        twitter: {
          key: 'PPswHRM94UNBlNxpRzQd1NZG5',
          secret: '8CTYTayeFOdaqZ3lslGgY6DSXO7Q98zEcGO0KVxEQuuRCNfrxW'
        }
      });
      const result = urlinfo.parse('https://twitter.com/LaughingSquid/status/702524296065847296', (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(d.parser === 'twitter', 'Twitter parser not used');
        done();
      });
    });
    lab.test('should error on tweet not found', done => {
      const urlinfo = new UrlInfo({
        twitter: {
          key: 'PPswHRM94UNBlNxpRzQd1NZG5',
          secret: '8CTYTayeFOdaqZ3lslGgY6DSXO7Q98zEcGO0KVxEQuuRCNfrxW'
        }
      });
      const result = urlinfo.parse('https://twitter.com/greg_allen/status/69535205348155564', (e, d) => {
        Hoek.assert(d === undefined, 'Data returned');
        Hoek.assert(typeof e === 'object', 'Non standard error');
        done();
      });
    });
  });

  lab.experiment('Facebook', () => {
    // TODO: Test photo url
    // TODO: Test fallback parser
    // TODO: Test post not found
    lab.test('should parse a facebook post url correctly', done => {
      const urlinfo = new UrlInfo({
        facebook: {
          token: '193676364331885|TDKyNF1xWb3uXlxnH2NxxgXCODQ'
        }
      });
      const result = urlinfo.parse('https://www.facebook.com/Bones/posts/10154050815309497', (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(d.parser === 'facebook', 'Facebook parser not used');
        done();
      });
    });
  });

  lab.experiment('Instagram', () => {
    // TODO: Test fallback parser
    // TODO: Test video post
    lab.test('should parse an instagram post url correctly', done => {
      const urlinfo = new UrlInfo({
        instagram: {
          token: '373385313.01658df.cb6eca695b8346dfb82d2b1bafd8ac38'
        }
      });
      const result = urlinfo.parse('https://www.instagram.com/p/dpbIsZhOvT/', (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(d.parser === 'instagram', 'Instagram parser not used');
        done();
      });
    });

    lab.test('should throw error on api failure', done => {
      const urlinfo = new UrlInfo({
        instagram: {
          token: '373385313.01658df.cb6eca695b8346dfb82d2b1bafd8ac38'
        }
      });
      const result = urlinfo.parse('https://www.instagram.com/p/BByOgmhpZ44/', (e, d) => {
        Hoek.assert(d === undefined, 'Data returned');
        Hoek.assert(typeof e === 'object', 'Non standard error');
        done();
      });
    });
  });

  lab.experiment('Vimeo', () => {
    // TODO: Test fallback parser
    // TODO: Test post not found
    // TODO: Test channel video page
    lab.test('should parse a vimeo url correctly', done => {
      const urlinfo = new UrlInfo({
        instagram: {
          token: '373385313.01658df.cb6eca695b8346dfb82d2b1bafd8ac38'
        }
      });
      const result = urlinfo.parse('https://vimeo.com/156455111', (e, d) => {
        Hoek.assert(e === null, 'Error returned');
        Hoek.assert(d.parser === 'vimeo', 'Vimeo parser not used');
        done();
      });
    });
  });
});
