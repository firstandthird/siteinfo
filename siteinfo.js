
var $url = require('url'),
$request = require('request'),
$ch = require('cheerio');

function SiteInfo(url, err, cb){

  var _this = {};

  function init(url, err, cb)
  {
    _this.url_object = {};

    if(url !== '' && url !== null)
    {
      _this.url_object = $url.parse(url);
    }
    
    _this.url = url;
    _this.err_cb = err;
    _this.cb = cb;

    getSite(url);

    return _this;
  }

  function absPath(path)
  {
    url_str = _this.url_object.protocol + "://" + _this.url_object.hostname;
    if( _this.url_object.pathname != '/')
    {
      url_str +=  _this.url_object.pathname;
    }

    return url_str + path.replace( url_str + "" );
  }

  function findData(documentBody)
  {
    // Check to see if there is data

    if( documentBody === '')
    {
      _this.err_cb({ 'message' : 'The document is empty'})
    }

    $ = $ch.load( documentBody );

    var data = {
      'pageTitle'          : null,
      'description'         : null,
      'descriptionSource'  : null,
      'presumedFavicon'    : absPath('/favicon.ico'),
      'favicon'             : null,
      'mainImage'          : null,
      'images'              : []
    };

    // Find the page title
    if($('title').text() != '')
    {
      data.pageTitle = $('title').text();
    }

    // First, og:description
    if($('meta[property="og:description"]').length > 0)
    {
      data.description = $('meta[property="og:description"]').attr('content');
      data.description_source = 'og:description';
    } else if($('meta[property="description"]').length > 0) {
      data.description = $('meta[property="description"]').attr('content');
      data.descriptionSource = 'description';
    }

    if( $('link[rel="shortcut icon"]').length > 0)
    {
      data.favicon = absPath($('link[rel="shortcut icon"]').attr('href'));
    }

    // Load all the images.
    var images = $('img');

    // Next, og:image
    if($('meta[property="og:image"]').length > 0)
    {
      data.mainImage = $('meta[property="og:image"]').attr('content');
    } else {
      // Now where are we going to find an image?
      var firstImage = images.get(0);
      if( firstImage !== undefined )
      {
        data.mainImage = absPath( $(firstImage).attr('src') );
      }
    }

    images.each(function(i){
      if($(this).attr('src') !== '')
      {
        data.images.push(absPath( $(this).attr('src') ));
      }
    });

    _this.cb( data );

  }

  function getSite(url)
  {
    if(url === '')
    {
      _this.err_cb({'message' : 'URL Can not be blank.'});
      return;
    }

    $request(_this.url, function(error, response, body){
      if (!error && response.statusCode == 200) {
        findData(body);
      } else {
        // Send the error callback
        _this.err_cb( { 'message' : "There was an error retrieving the url" } );
      }
    });
  }

  return init(url, err, cb);

}

module.exports = function(url, err, cb)
{
  return SiteInfo(url, err, cb);
}