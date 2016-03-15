/* eslint strict: 0, max-len: 0, consistent-return: 0 */
/*
Use this to get an instagram access_token

curl \-F 'client_id=CLIENT-ID' \
    -F 'client_secret=CLIENT-SECRET' \
    -F 'grant_type=authorization_code' \
    -F 'redirect_uri=YOUR-REDIRECT-URI' \
    -F 'code=CODE' \
    https://api.instagram.com/oauth/access_token
*/

'use strict';

const Request = require('request');
const Hoek = require('hoek');

class Instagram {
  constructor(config, urlObject, cb) {
    this.urlObject = urlObject;
    this.cb = cb;
    this.id = '';
    this.data = {};

    const defaults = {
      key: '',
      clientId: '',
      request: {
        json: true
      }
    };

    this.config = Hoek.applyToDefaults(defaults, config, true);

    this.getPostInfo();
  }

  getPostInfo() {
    const baseUrl = `https://api.instagram.com/oembed/?url=${this.urlObject.href}`;
    let post = {};

    const options = {
      url: baseUrl
    };

    Request.get(options, (err, res, payload) => {
      if (err) {
        return this.cb(err);
      }

      if (res.statusCode !== 200) {
        return this.cb({ err: payload });
      }

      // TODO: check if post exists
      try {
        post = JSON.parse(payload);
      } catch (e) {
        return this.cb('There was an error parsing response');
      }

      this.data = {
        pageTitle: `${Hoek.reach(post, 'author_name')} on Instagram`,
        description: Hoek.reach(post, 'title'),
        descriptionSource: 'caption',
        favicon: 'https://instagramstatic-a.akamaihd.net/favicon.ico',
        mainImage: Hoek.reach(post, 'thumbnail_url'),
        images: [],
        author: Hoek.reach(post, 'author_name'),
        parser: 'instagram'
      };

      this.cb(null, this.data);
    });
  }
}

module.exports = Instagram;
