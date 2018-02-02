/* eslint strict: 0, max-len: 0, consistent-return: 0 */
'use strict';

const Wreck = require('wreck');
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

    return this;
  }

  async getSite() {
    const id = this.urlObject.path.match(/\/(v\/|u\/\w\/|embed\/|watch\?v=|\&v=)?([^#\&\?]*).*/i);

    if (id && id[2].length === 11) {
      this.id = id[2];
      const info = await this.getVideoInfo();
      return info;
    }

    // false = no id found. Revert to basic parser
    return false;
  }

  async getVideoInfo() {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${this.id}&key=${this.config.key}`;
    
    const { res, payload } = await Wreck.get(url, { json: true } );
    
    if (res.statusCode !== 200) {
      throw new Error(`There was an error retrieving url ${url}`);
    }
    
    if (payload.error) {
      throw new Error(payload.error);
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

    return this.data;
  }
}

module.exports = Youtube;
