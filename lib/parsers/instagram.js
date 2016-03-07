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
      request: {
        json: true
      }
    };

    this.config = Hoek.applyToDefaults(defaults, config, true);

    this.parseId();
  }

  parseId() {
    const id = this.urlObject.path.match(/\/p\/(\w+).*/i);

    if (id && id[1]) {
      this.id = id[1];
      return this.getPostInfo();
    }

    // false = no id found. Revert to basic parser
    this.cb(null, false);
  }

  getPostInfo() {
    const options = {
      url: `https://api.instagram.com/v1/media/shortcode/${this.id}?access_token=${this.config.token}`
    };

    Request.get(Hoek.applyToDefaults(options, this.config.request), (err, res, payload) => {
      if (err) {
        return this.cb(err);
      }

      // TODO: check if post exists
      const post = payload.data;

      this.data = {
        pageTitle: `${Hoek.reach(post, 'user.full_name')} on Instagram`,
        description: Hoek.reach(post, 'caption.text'),
        descriptionSource: 'caption',
        favicon: 'https://instagramstatic-a.akamaihd.net/favicon.ico',
        mainImage: Hoek.reach(post, 'images.standard_resolution'),
        images: [],
        parser: 'instagram'
      };

      this.cb(null, this.data);
    });
  }
}

module.exports = Instagram;
