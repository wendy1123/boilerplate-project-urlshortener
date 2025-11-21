require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// In-memory database for URL mapping
const urlDatabase = {};
let shortUrlCounter = 1;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

// Serve the root page
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const validUrlRegex = /^(http:\/\/|https:\/\/)[a-z0-9]+(\.[a-z0-9]+)+([\/\?].*)?$/i;


app.post('/api/shorturl', function(req, res) {
  const { url } = req.body;


  if (!validUrlRegex.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  
  urlDatabase[shortUrlCounter] = url;
  const short_url = shortUrlCounter;
  shortUrlCounter++;

  res.json({
    original_url: url,
    short_url: short_url
  });
});

// GET /api/shorturl/:short_url to redirect to the original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;

  // Check if the short URL exists in the database
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    // Redirect to the original URL
    res.redirect(originalUrl);
  } else {
    // If the short URL doesn't exist, send an error message
    res.json({ error: 'short URL not found' });
  }
});

// Start the server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
