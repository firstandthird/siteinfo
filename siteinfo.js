
$http = require('http');
$url = require('url');
ch = require('cheerio');


var HTMLPage = function()
{
  var _this = {
    'document_body' : ''
  };

  _this.addToBody = function(str)
  {
    _this.document_body += str;
  }

  _this.body = function(){
    return _this.document_body;
  }

  return _this;
}

function SiteInfo(url, err, cb){

  var _this = {};

  function _init(url, err, cb)
  {
    _this.url_object = {};

    if(url !== '' && url !== null)
    {
      _this.url_object = $url.parse(url);
    }
    
    _this.err_cb = err;
    _this.cb = cb;
    _this.html_page = HTMLPage();

    // DO the action:
    _go();

    return _this;
  }

  function _go()
  {
    var req = get_site(_this.url_object);
  }

  function process_data(chunk)
  {
    _this.html_page.addToBody( chunk.toString() );
  }

  function abs_path(path)
  {
    url_str = _this.url_object.protocol + "://" + _this.url_object.hostname;
    if( _this.url_object.pathname != '/')
    {
      url_str +=  _this.url_object.pathname;
    }

    return url_str + path.replace( url_str + "" );
  }

  function find_data()
  {
    // Check to see if there is data

    if( _this.html_page.body() === '')
    {
      _this.err_cb({ 'message' : 'The document is empty'})
    }
    $ = ch.load( _this.html_page.body() );

    var data = {
      'page_title'          : null,
      'description'         : null,
      'description_source'  : null,
      'presumed_favicon'    : abs_path('/favicon.ico'),
      'favicon'             : null,
      'main_image'          : null,
      'images'              : []
    };

    // Find the page title
    if($('title').text() != '')
    {
      data.page_title = $('title').text();
    }

    // First, og:description
    if($('meta[property="og:description"]').length > 0)
    {
      data.description = $('meta[property="og:description"]').attr('content');
      data.description_source = 'og:description';
    } else if($('meta[property="description"]').length > 0) {
      data.description = $('meta[property="description"]').attr('content');
      data.description_source = 'description';
    }

    if( $('link[rel="shortcut icon"]').length > 0)
    {
      data.favicon = abs_path($('link[rel="shortcut icon"]').attr('href'));
    }

    // Load all the images.
    var images = $('img');

    // Next, og:image
    if($('meta[property="og:image"]').length > 0)
    {
      data.main_image = $('meta[property="og:image"]').attr('content');
    } else {
      // Now where are we going to find an image?
      var first_image = images.get(0);
      if( first_image !== undefined )
      {
        data.main_image = abs_path( $(first_image).attr('src') );
      }
    }

    images.each(function(i){
      if($(this).attr('src') !== '')
      {
        data.images.push(abs_path( $(this).attr('src') ));
      }
    });

    _this.cb( data );

  }

  function get_site(url)
  {
    var _options = url;

    if( _options.host === undefined )
    {
      _this.err_cb({ 'message' : 'Site URL can not be blank'});
      return false;
    }

    return $http.get(_options, function(res){
      // Checking for any errors.
      if( res.statusCode == '200')
      {
        res.on("data", process_data);
        res.on("end", find_data);
      } else {
        // Send the error callback
        _this.err_cb( { 'message' : "There was an error retrieving the url StatusCode: " + res.statusCode } );
      }
    }).on("error", function(e){
      _this.err_cb(e);
    });
  }

  return _init(url, err, cb);

}

module.exports = function(url, err, cb)
{
  return SiteInfo(url, err, cb);
}