/* eslint strict: 0, new-cap: 0, no-new: 0 */

'use strict';

const Hoek = require('hoek');
const url = require('url');

// Parsers
const Youtube = require('./parsers/youtube');
const Twitter = require('./parsers/twitter');
const Facebook = require('./parsers/facebook');
const Instagram = require('./parsers/instagram');
const Vimeo = require('./parsers/vimeo');
const Basic = require('./parsers/basic');

class UrlInfo {
  constructor(options) {
    const defaults = {
      twitter: {
        key: '',
        secret: ''
      },
      facebook: {
        token: ''
      },
      instagram: {
        token: ''
      },
      youtube: {
        key: ''
      },
      vimeo: {},
      basic: {}
    };

    this.options = Hoek.applyToDefaults(defaults, options, true);

    return this;
  }

  parse(uri, cb) {
    this.url = uri;
    this.urlObject = {};

    if (this.url !== '' && this.url !== null) {
      this.urlObject = url.parse(this.url);
    }

    this.cb = cb;
    this.data = {};

    this.detectProvider();

    return this;
  }

  checkCallback(err, data) {
    // err === false = use fallback
    if (err === false) {
      return new Basic(this.options.basic, this.urlObject, this.cb);
    }

    return this.cb(err, data);
  }

  detectProvider() {
    const host = this.urlObject.hostname;

    if (/(www\.)?(youtube\.com)|(youtu\.be)/i.test(host)) {
      new Youtube(this.options.youtube, this.urlObject, this.checkCallback.bind(this));
    } else if (/(www\.)?facebook\.com/.test(host)) {
      new Facebook(this.options.facebook, this.urlObject, this.checkCallback.bind(this));
    } else if (/(www\.)?twitter\.com/i.test(host)) {
      new Twitter(this.options.twitter, this.urlObject, this.checkCallback.bind(this));
    } else if (/(www\.)?((instagram\.com)|(instagr\.am))/.test(host)) {
      new Instagram(this.options.instagram, this.urlObject, this.checkCallback.bind(this));
    } else if (/(www\.)?vimeo\.com/.test(host)) {
      new Vimeo(this.options.vimeo, this.urlObject, this.checkCallback.bind(this));
    } else {
      new Basic(this.options.basic, this.urlObject, this.cb);
    }
  }
}

module.exports = UrlInfo;
