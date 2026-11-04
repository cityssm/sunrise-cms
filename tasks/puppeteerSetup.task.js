import { debuglog } from 'node:util';
import { testInstalledBrowser } from '@cityssm/pdf-puppeteer';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
const debug = debuglog(`${DEBUG_NAMESPACE}:tasks:puppeteer-setup`);
const browser = getConfigProperty('settings.printPdf.browser');
debug('Testing configured Puppeteer browser: %o', browser);
const result = await testInstalledBrowser(browser, true);
debug('Puppeteer browser test result for %o: %o', browser, result);
if (result.success) {
    debug('Configured Puppeteer browser test succeeded: %o', browser);
}
else {
    const otherBrowser = browser === 'chrome' ? 'firefox' : 'chrome';
    debug('Testing other Puppeteer browser: %o', otherBrowser);
    const otherResult = await testInstalledBrowser(otherBrowser, true);
    debug('Other Puppeteer browser test result for %o: %o', otherBrowser, otherResult);
}
