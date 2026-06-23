const express = require('express');
const compression = require('compression');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Gzip all responses
app.use(compression());

// Serve static assets with caching (long for assets, no-cache for html)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

const routes = {
  '/':              'index.html',
  '/how-it-works':  'how-it-works.html',
  '/pricing':       'pricing.html',
  '/rider-app':     'rider-app.html',
  '/driver-app':    'driver-app.html',
  '/login':         'login.html',
  '/request-demo':  'request-demo.html',
};

Object.entries(routes).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', file));
  });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Rider site running on port ${PORT}`);
});
