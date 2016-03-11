/* eslint strict: 0, max-len: 0, consistent-return: 0 */
'use strict';

const Request = require('request');
const Hoek = require('hoek');

class Twitter {
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
    const id = this.urlObject.path.match(/\/(?:#!\/)?(\w+)\/status(es)?\/(\d+).*/i);

    if (id && id[3]) {
      this.id = id[3];
      return this.getTweetInfo();
    }

    // false = no id found. Revert to basic parser
    this.cb(null, false);
  }

  getTweetInfo() {
    const options = {
      url: `https://api.twitter.com/1.1/statuses/show.json?id=${this.id}`,
      oauth: {
        consumer_key: this.config.key,
        consumer_secret: this.config.secret
      }
    };

    Request.get(Hoek.applyToDefaults(options, this.config.request), (err, res, payload) => {
      if (err) {
        return this.cb(err);
      }

      if (res.statusCode !== 200) {
        return this.cb(payload.errors);
      }
      // TODO: check if tweet exists
      const tweet = payload;

      this.data = {
        pageTitle: `${tweet.user.name} on Twitter`,
        description: tweet.text,
        descriptionSource: 'text',
        favicon: 'https://abs.twimg.com/favicons/favicon.ico',
        mainImage: Hoek.reach(tweet, 'user.profile_image_url_https'),
        images: [],
        author: Hoek.reach(tweet, 'user.screen_name'),
        parser: 'twitter'
      };

      const media = Hoek.reach(tweet, 'entities.media');

      if (media) {
        for (const mediaItem of media) {
          if (mediaItem.type === 'photo') {
            this.data.images.push(mediaItem.media_url_https);
          }
        }
      }

      this.cb(null, this.data);
    });
  }
}

module.exports = Twitter;
