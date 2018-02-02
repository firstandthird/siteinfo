/* eslint strict: 0, max-len: 0, consistent-return: 0 */
'use strict';

const Wreck = require('wreck');
const Hoek = require('hoek');

class Twitter {
  constructor(config, urlObject) {
    this.urlObject = urlObject;
    this.id = '';
    this.data = {};

    const defaults = {
      key: ''
    };

    this.config = Hoek.applyToDefaults(defaults, config, true);

    return this;
  }

  async getInfo() {
    this.itemUrl = this.urlObject.href;

    const data = await this.getTweetInfo();

    // false = no id found. Revert to basic parser
    return data;
  }

  async getTweetInfo() {
    const url = `https://publish.twitter.com/oembed?omit_script=1&url=${this.itemUrl}`;
    
    const { res, payload } = await Wreck.get(url, { json: true });
    
    if (res.statusCode !== 200) {
      throw new Error(`Cannot retrieve twitter url: ${url}`);
    }
    
    const tweet = payload;
    this.data = {
      pageTitle: `${tweet.author_name} on Twitter`,
      description: tweet.html,
      descriptionSource: 'text',
      favicon: 'https://abs.twimg.com/favicons/favicon.ico',
      images: [],
      author: tweet.author_name,
      parser: 'twitter'
    };

    return this.data;

    /* Request.get(Hoek.applyToDefaults(options, this.config.request), (err, res, payload) => {
      if (err) {
        return this.cb(err);
      }

      if (res.statusCode !== 200) {
        return this.cb(payload.errors);
      }
      // TODO: check if tweet exists

      
      const media = Hoek.reach(tweet, 'entities.media');

      if (media) {
        for (const mediaItem of media) {
          if (mediaItem.type === 'photo') {
            this.data.images.push(mediaItem.media_url_https);
          }
        }
      }

      this.cb(null, this.data);
    }); */
  }
}

module.exports = Twitter;
