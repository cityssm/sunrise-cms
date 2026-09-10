const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location to a local folder inside your project
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
