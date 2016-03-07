/* eslint strict: 0, max-len: 0, consistent-return: 0 */
'use strict';

const Request = require('request');
const Hoek = require('hoek');

class Youtube {
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
    const id = this.urlObject.path.match(/\/(v\/|u\/\w\/|embed\/|watch\?v=|\&v=)?([^#\&\?]*).*/i);

    if (id && id[2].length === 11) {
      this.id = id[2];
      return this.getVideoInfo();
    }

    // false = no id found. Revert to basic parser
    this.cb(null, false);
  }

  getVideoInfo() {
    const options = {
      url: `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${this.id}&key=${this.config.key}`
    };

    Request.get(Hoek.applyToDefaults(options, this.config.request), (err, res, payload) => {
      if (err) {
        return this.cb(err);
      }

      if (payload.error) {
        return this.cb(payload.error);
      }

      // TODO: check if video exists
      const snippet = Hoek.reach(payload, 'items.0.snippet');

      this.data = {
        pageTitle: snippet.title,
        description: snippet.description,
        descriptionSource: 'description',
        favicon: 'https://www.youtube.com/favicon.ico',
        mainImage: Hoek.reach(snippet, 'thumbnails.high.url'),
        images: [],
        embedCode: `
          <iframe
            width="420"
            height="315"
            src="//www.youtube.com/embed/${this.id}"
            frameborder="0"
            allowfullscreen>
          </iframe>`,
        parser: 'youtube'
      };

      // First thumbnail is just default full-res
      for (let i = 1; i < 4; i++) {
        this.data.images.push(`https://img.youtube.com/vi/${this.id}/${i}.jpg`);
      }

      this.cb(null, this.data);
    });
  }
}

module.exports = Youtube;
