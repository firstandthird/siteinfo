/* eslint strict: 0, max-len: 0, consistent-return: 0 */
'use strict';

const Request = require('request');
const Hoek = require('hoek');

class Vimeo {
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
    const id = this.urlObject.path.match(/\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|[\?#])/i);

    if (id && id[3]) {
      this.id = id[3];
      return this.getVideoInfo();
    }

    // false = no id found. Revert to basic parser
    this.cb(null, false);
  }

  getVideoInfo() {
    const options = {
      url: `https://vimeo.com/api/v2/video/${this.id}.json`
    };

    Request.get(Hoek.applyToDefaults(options, this.config.request), (err, res, payload) => {
      if (err) {
        return this.cb(err);
      }

      // TODO: check if video exists
      const video = payload[0];

      this.data = {
        pageTitle: video.title,
        description: video.description,
        descriptionSource: 'description',
        favicon: 'https://vimeo.com/favicon.ico',
        mainImage: video.thumbnail_large,
        images: [],
        embedCode: `
        <iframe
          src="//player.vimeo.com/video/${this.id}"
          width="500"
          height="281"
          frameborder="0"
          webkitallowfullscreen
          mozallowfullscreen
          allowfullscreen>
        </iframe>`,
        parser: 'vimeo'
      };

      this.cb(null, this.data);
    });
  }
}

module.exports = Vimeo;
