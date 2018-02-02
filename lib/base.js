/* eslint strict: 0, new-cap: 0, no-new: 0 */

'use strict';

const Hoek = require('hoek');
const url = require('url');

// Parsers
const Youtube = require('./parsers/youtube');
const Instagram = require('./parsers/instagram');

const oembed = require('./parsers/oembed');
const Basic = require('./parsers/basic');

class UrlInfo {
  constructor(options) {
    const defaults = {
      instagram: {
        token: ''
      },
      youtube: {
        key: ''
      },
      basic: {}
    };

    this.options = Hoek.applyToDefaults(defaults, options, true);

    return this;
  }

  async parse(uri) {
    this.url = uri;
    this.urlObject = {};

    if (this.url !== '' && this.url !== null) {
      this.urlObject = url.parse(this.url);
    }
    this.data = {};

    const result = await this.detectProvider();

    return result;
  }

  checkCallback(err, data) {
    // err === false = use fallback
    if (err === false) {
      return new Basic(this.options.basic, this.urlObject, this.cb);
    }

    return this.cb(err, data);
  }

  async detectProvider() {
    const host = this.urlObject.hostname;
    let parser;
    if (/(www\.)?(youtube\.com)|(youtu\.be)/i.test(host)) {
      parser = new Youtube(this.options.youtube, this.urlObject);
    } else if (/(www\.)?twitter\.com/i.test(host)) {
      const data = await oembed(this.urlObject.href, 'twitter');
      return data;
    } else if (/(www\.)?((instagram\.com)|(instagr\.am))/.test(host)) {
      parser = new Instagram({}, this.urlObject);
    } else if (/(www\.)?vimeo\.com/.test(host)) {
      const data = await oembed(this.urlObject.href, 'vimeo');
      return data;
    } else {
      parser = new Basic(this.options.basic, this.urlObject);
    }

    const result = await parser.getInfo();
    return result;
  }
}

module.exports = UrlInfo;
