
var $url = require('url');
var $request = require('request');
var $ch = require('cheerio');

var SiteInfo = function(url, cb) {

  var self = {};

  var init = function(url, cb) {
    self.urlObject = {};

    if (url !== '' && url !== null) {
      self.urlObject = $url.parse(url);
    }
    self.url = url;
    self.cb = cb;

    getSite(url);

    return self;
  }

  var absPath = function(path) {
    if ( path.indexOf('http://') > -1 || path.indexOf('//') > -1 ) {
      return path;
    }

    urlHref = self.urlObject.href;

    return $url.resolve( urlHref, path );
  }

  var parseYouTube = function(data) {
    var ytIdRegev = /(?:http|https|)(?::\/\/|)(?:www.|)(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/ytscreeningroom\?v=|\/feeds\/api\/videos\/|\/user\S*[^\w\-\s]|\S*[^\w\-\s]))([\w\-]{11})[a-z0-9;:@#?&%=+\/\$_.-]*/i
    var result = ytIdRegev.exec(self.url);
    if (result !== null && result[1] !== undefined) {
      var videoId = result[1];
      data.youtubeThumbnails = [];
      for (i = 0; i < 4; i++) {
        data.youtubeThumbnails.push('http://img.youtube.com/vi/' + videoId + '/' + i + '.jpg');
      }
      data.embedCode =  '<iframe width="420" height="315" src="//www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>';
    }
  }

  var parseVimeo = function(data) {
    var vimeoRegex = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|[\?#])/
    var result = vimeoRegex.exec(self.url);
    if (result !== null && result[3] !== undefined) {
      return result[3];
    }

    return null;
  }

  var getVimeoInfo = function(vimeoId, data) {
    $request({ url: 'http://vimeo.com/api/v2/video/' + vimeoId + '.json', json: true }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var responseObj = body[0];
        data.vimeoThumbnails = {};
        if (responseObj.thumbnail_small !== undefined) {
          data.vimeoThumbnails.small = responseObj.thumbnail_small;
        }

        if (responseObj.thumbnail_medium !== undefined) {
          data.vimeoThumbnails.medium = responseObj.thumbnail_medium;
        }

        if (responseObj.thumbnail_large !== undefined) {
          data.vimeoThumbnails.large = responseObj.thumbnail_large;
        }

        data.embedCode = '<iframe src="//player.vimeo.com/video/' + vimeoId + '" width="500" height="281" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';

      }

      self.cb( null, data );
    });
  };

  var findData = function(documentBody) {
    // Check to see if there is data

    if ( documentBody === '') {
      self.cb({ message: 'The document is empty' }, false)
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
    } else if ($('meta[name="description"]').length > 0) {
      data.description = $('meta[name="description"]').attr('content');
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

    parseYouTube(data);
    var vimeoId = parseVimeo(data);

    if (vimeoId !== null) {
      getVimeoInfo(vimeoId, data);
    } else {
      self.cb( null, data );
    }
  }

  var getSite = function(url) {
    if (url === '') {
      self.cb({ message: 'URL Can not be blank.' }, false );
      return;
    }

    $request(self.url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        findData(body);
      } else {
        // Send the error callback
        self.cb( { message: 'There was an error retrieving the url' }, false );
      }
    });
  }

  return init(url, cb);

}

module.exports = function(url, err, cb) {
  return SiteInfo(url, err, cb);
}