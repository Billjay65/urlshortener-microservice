require('dotenv').config();
// require crypto for hashing url
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

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
app.post('/api/shorturl', function (req, res) {
  // get posted url from html form
  const url = req.body.url;
  // create shortened url 
  const base62Chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // convert url to five digit number
  function urlTo5DigitInt(url) {
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const hashInt = parseInt(hash.slice(0, 8), 16); // First 8 hex chars = ~32 bits
    return 10000 + (hashInt % 90000); // Keep it between 10000–99999
  }

  res.json({
    original_url: url,
    short_url: urlTo5DigitInt(url)
  });
});
/*** end myversion ***/

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
