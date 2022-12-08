const withPWA = require('next-pwa')({
  dest: 'public',
  cacheOnFrontEndNav: true,
  reloadOnOnline: false,
});

module.exports = withPWA({
  // next.js config
});
