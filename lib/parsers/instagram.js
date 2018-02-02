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

const Wreck = require('wreck');
const Hoek = require('hoek');

class Instagram {
  constructor(config, urlObject) {
    this.urlObject = urlObject;
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
    return this;
  }

  async getInfo() {
    const baseUrl = `https://api.instagram.com/oembed/?url=${this.urlObject.href}`;
    let post = {};

    const options = {
      url: baseUrl
    };
    const { res, payload } = await Wreck.get(baseUrl, { json: true });
    
    if (res.statusCode !== 200) {
      throw new Error(`There was an error retriving url: ${baseUrl}`);
    }

    this.data = {
      pageTitle: `${Hoek.reach(payload, 'author_name')} on Instagram`,
      description: Hoek.reach(payload, 'title'),
      descriptionSource: 'caption',
      favicon: 'https://instagramstatic-a.akamaihd.net/favicon.ico',
      mainImage: Hoek.reach(payload, 'thumbnail_url'),
      images: [],
      author: Hoek.reach(payload, 'author_name'),
      parser: 'instagram'
    };
    
    return this.data;
  }
}

module.exports = Instagram;
