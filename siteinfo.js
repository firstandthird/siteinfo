
var $url = require('url');
var $request = require('request');
var $ch = require('cheerio');

var SiteInfo = function(url, err, cb) {

  var self = {};

  var init = function(url, err, cb) {
    self.urlObject = {};

    if (url !== '' && url !== null) {
      self.urlObject = $url.parse(url);
    }
    self.url = url;
    self.errCb = err;
    self.cb = cb;

    getSite(url);

    return self;
  }

  var absPath = function(path) {
    urlStr = self.urlObject.protocol + '://' + self.urlObject.hostname;
    if ( self.urlObject.pathname != '/') {
      urlStr +=  self.urlObject.pathname;
    }

    return urlStr + path.replace( urlStr );
  }

  var findData = function(documentBody) {
    // Check to see if there is data

    if ( documentBody === '') {
      self.errCb({ message: 'The document is empty' })
    }

    $ = $ch.load( documentBody );

    var data = {
      pageTitle: null,
      description: null,
      descriptionSource: null,
      presumedFavicon: absPath('/favicon.ico'),
      favicon: null,
      mainImage: null,
      images: []
    };

    // Find the page title
    if ($('title').text() != '') {
      data.pageTitle = $('title').text();
    }

    // First, og:description
    if ($('meta[property="og:description"]').length > 0) {
      data.description = $('meta[property="og:description"]').attr('content');
      data.descriptionSource = 'og:description';
    } else if ($('meta[property="description"]').length > 0) {
      data.description = $('meta[property="description"]').attr('content');
      data.descriptionSource = 'description';
    }

    if ( $('link[rel="shortcut icon"]').length > 0) {
      data.favicon = absPath($('link[rel="shortcut icon"]').attr('href'));
    }

    // Load all the images.
    var images = $('img');

    // Next, og:image
    if ($('meta[property="og:image"]').length > 0) {
      data.mainImage = $('meta[property="og:image"]').attr('content');
    } else {
      // Now where are we going to find an image?
      var firstImage = images.get(0);
      if (firstImage !== undefined ) {
        data.mainImage = absPath( $(firstImage).attr('src') );
      }
    }

    images.each(function(i) {
      if ($(this).attr('src') !== '') {
        data.images.push(absPath( $(this).attr('src') ));
      }
    });

    self.cb( data );

  }

  var getSite = function(url) {
    if (url === '') {
      self.errCb({ message: 'URL Can not be blank.' } );
      return;
    }

    $request(self.url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        findData(body);
      } else {
        // Send the error callback
        self.errCb( { message: 'There was an error retrieving the url' } );
      }
    });
  }

  return init(url, err, cb);

}

module.exports = function(url, err, cb) {
  return SiteInfo(url, err, cb);
}