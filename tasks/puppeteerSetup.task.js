import { testInstalledBrowser } from '@cityssm/pdf-puppeteer';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:tasks:puppeteerSetup`);
const browser = getConfigProperty('settings.printPdf.browser');
debug('Testing configured Puppeteer browser: %o', browser);
const result = await testInstalledBrowser(browser, true);
debug('Puppeteer browser test result: %o', result);
if (!result.success) {
    const otherBrowser = browser === 'chrome' ? 'firefox' : 'chrome';
    debug('Testing other Puppeteer browser: %o', otherBrowser);
    const otherResult = await testInstalledBrowser(otherBrowser, true);
    debug('Other Puppeteer browser test result: %o', otherResult);
}
