require('dotenv').config();
// require crypto for hashing url
const crypto = require('crypto');
const dns = require('dns');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// In-memory store for short URL mappings
const urlStore = {};

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// set up body parsing middleware to handle post request
app.use(bodyParser.urlencoded({extended: false}));

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

/*** myversion ***/
// convert url to five digit integer hash
  function urlTo5DigitInt(url) {
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const hashInt = parseInt(hash.slice(0, 8), 16); // First 8 hex chars = ~32 bits
    return 10000 + (hashInt % 90000); // Keep it between 10000–99999
  }

// api end point server for api shorturl
app.post('/api/shorturl', function (req, res) {
  // get posted url from html form
  const url = req.body.url;

  // Ensure protocol is included to parse properly
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return res.json({ error: 'invalid url' });
  }

  // parse, verify, convert and store url or catch error
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    dns.lookup(hostname, (err, address) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      const shortUrl = urlTo5DigitInt(url);
      urlStore[shortUrl] = url;

      res.json({
        original_url: url,
        short_url: shortUrl
      });
    });

  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

// api server end point for /api/shorturl/:short-url, redirect
app.get('/api/shorturl/:short_url', function (req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlStore[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({
      error: 'No short URL found for given input'
    });
  }
});
/*** end myversion ***/

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
