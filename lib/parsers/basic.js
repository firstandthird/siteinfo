/* eslint strict: 0, max-len: 0, consistent-return: 0 */
'use strict';

const Url = require('url');
const Hoek = require('hoek');
const Request = require('request');
const $ch = require('cheerio');

class Basic {
  constructor(config, urlObject, cb) {
    this.urlObject = urlObject;
    this.cb = cb;

    const defaults = {
      request: {
        jar: true
      }
    };

    this.config = Hoek.applyToDefaults(defaults, config, true);

    this.getSite();
  }

  getSite() {
    const options = {
      url: this.urlObject.href
    };

    Request.get(Hoek.applyToDefaults(options, this.config.request), (err, res, payload) => {
      if (err) {
        return this.cb(err);
      }

      if (res.statusCode !== 200) {
        return this.cb({ message: 'There was an error retrieving the url', res });
      }

      this.body = payload;

      this.parseBody();
    });
  }

  parseBody() {
    // Check to see if there is data
    if (this.body === '') {
      return this.cb({ message: 'The document is empty' });
    }

    const $ = $ch.load(this.body);

    this.data = {
      pageTitle: null,
      description: null,
      descriptionSource: null,
      presumedFavicon: this.absPath('/favicon.ico'),
      favicon: null,
      mainImage: null,
      images: []
    };

    // Find the page title
    if ($('title').text() !== '') {
      this.data.pageTitle = $('title').text();
    }

    // First, og:description
    if ($('meta[property="og:description"]').length > 0) {
      this.data.description = $('meta[property="og:description"]').attr('content');
      this.data.descriptionSource = 'og:description';
    } else if ($('meta[name="description"]').length > 0) {
      this.data.description = $('meta[name="description"]').attr('content');
      this.data.descriptionSource = 'description';
    }

    if ($('link[rel="shortcut icon"]').length > 0) {
      this.data.favicon = this.absPath($('link[rel="shortcut icon"]').attr('href'));
    }

    // Load all the images.
    const images = $('img');

    // Next, og:image
    if ($('meta[property="og:image"]').length > 0) {
      this.data.mainImage = $('meta[property="og:image"]').attr('content');
    } else {
      // Now where are we going to find an image?
      const firstImage = images.get(0);
      if (firstImage !== undefined && $(firstImage).attr('src') !== undefined) {
        this.data.mainImage = this.absPath($(firstImage).attr('src'));
      }
    }

    images.each(i => {
      if ($(images[i]).attr('src')) {
        this.data.images.push(this.absPath($(images[i]).attr('src')));
      }
    });

    this.cb(null, this.data);
  }

  absPath(path) {
    if (path.indexOf('http://') > -1 || path.indexOf('//') > -1) {
      return path;
    }

    const urlHref = this.urlObject.href;

    return Url.resolve(urlHref, path);
  }
}

module.exports = Basic;
