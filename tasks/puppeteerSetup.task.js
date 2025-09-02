import { testInstalledBrowser } from '@cityssm/pdf-puppeteer';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../debug.config.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:puppeteerSetup`);
const browser = getConfigProperty('settings.printPdf.browser');
debug('Testing browser: %o', browser);
await testInstalledBrowser(browser, true);
