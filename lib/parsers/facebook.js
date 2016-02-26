/* eslint strict: 0, max-len: 0, consistent-return: 0 */
'use strict';

const Request = require('request');
const Hoek = require('hoek');

class Facebook {
  constructor(config, urlObject, cb) {
    this.urlObject = urlObject;
    this.cb = cb;
    this.username = '';
    this.userId = '';
    this.id = '';
    this.data = {};

    const defaults = {
      key: '',
      request: {
        json: true
      }
    };

    this.config = Hoek.applyToDefaults(defaults, config, true);

    this.parseId();
  }

  parseId() {
    // TODO: Support photo urls
    const id = this.urlObject.path.match(/\/(\w+)\/posts\/(\d+).*/i);

    if (id) {
      if (id[1]) {
        this.username = id[1];
      }

      if (id[2]) {
        this.id = id[2];
      }

      return this.getUsernameId();
    }

    // false = no id found. Revert to basic parser
    this.cb(null, false);
  }

  getUsernameId() {
    const options = {
      url: `https://graph.facebook.com/${this.username}?access_token=${this.config.token}`
    };

    Request.get(Hoek.applyToDefaults(options, this.config.request), (err, res, payload) => {
      if (err) {
        return this.cb(err);
      }

      this.userId = payload.id;

      this.getPostInfo();
    });
  }

  getPostInfo() {
    const options = {
      url: `
        https://graph.facebook.com/v2.3/${this.userId}_${this.id}?access_token=${this.config.token}&fields=name,description,picture`
    };

    Request.get(Hoek.applyToDefaults(options, this.config.request), (err, res, payload) => {
      if (err) {
        return this.cb(err);
      }

      // TODO: check if post exists
      const post = payload;

      this.data = {
        pageTitle: post.name,
        description: post.description,
        descriptionSource: 'description',
        favicon: 'https://www.facebook.com/favicon.ico',
        mainImage: post.picture,
        images: [],
        parser: 'facebook'
      };

      this.cb(null, this.data);
    });
  }
}

module.exports = Facebook;
