require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'urlData.json'); // persistent JSON file

// Load data from file or initialize
let urlDatabase = {};
let shortUrlCounter = 1;

if (fs.existsSync(DATA_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    urlDatabase = data.urls || {};
    shortUrlCounter = data.counter || 1;
  } catch (err) {
    console.error('Error reading data file:', err);
  }
}

// Save data helper
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ urls: urlDatabase, counter: shortUrlCounter }, null, 2));
}

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// POST /api/shorturl
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate URL: must start with http:// or https://
  if (!/^https?:\/\//i.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Check if URL already exists
  const existing = Object.entries(urlDatabase).find(([key, value]) => value === originalUrl);
  if (existing) {
    return res.json({ original_url: originalUrl, short_url: Number(existing[0]) });
  }

  // Save new URL
  const short_url = shortUrlCounter++;
  urlDatabase[short_url] = originalUrl;
  saveData();

  res.json({ original_url: originalUrl, short_url });
});

// GET /api/shorturl/:short_url
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = Number(req.params.short_url);
  const originalUrl = urlDatabase[shortUrl];

  if (!originalUrl) {
    return res.json({ error: 'short URL not found' });
  }

  res.redirect(originalUrl);
});

// Start the server
app.listen(port, () => console.log(`Listening on port ${port}`));
