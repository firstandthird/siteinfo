const Wreck = require('wreck');

module.exports = async function(url, parser) {
  const oembedUrl = {
    vimeo: 'https://vimeo.com/api/oembed.json?url=',
    twitter: 'https://publish.twitter.com/oembed?omit_script=true&&url='
  };

  if (!oembedUrl[parser]) {
    throw new Error(`No oembed api for ${parser}`);
  }

  const apiUrl = `${oembedUrl[parser]}${url}`;

  const { res, payload } = await Wreck.get(apiUrl, { json: 1 });

  const data = {
    pageTitle: payload.title,
    description: payload.description || '',
    descriptionSource: 'description',
    favicon: 'https://vimeo.com/favicon.ico',
    mainImage: payload.thumbnail_url || '',
    images: [],
    parser: 'vimeo'
  };

  if (parser === 'vimeo') {
    data.embedCode = `
      <iframe
        src="//player.vimeo.com/video/${payload.video_id}"
        width="500"
        height="281"
        frameborder="0"
        webkitallowfullscreen
        mozallowfullscreen
        allowfullscreen>
      </iframe>`;
  }

  return data;
};

