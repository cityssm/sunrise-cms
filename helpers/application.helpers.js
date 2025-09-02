import { testInstalledBrowser } from '@cityssm/pdf-puppeteer';
import { initializeDatabase } from '../database/initializeDatabase.js';
import { getConfigProperty } from './config.helpers.js';
export async function initializeApplication() {
    initializeDatabase();
    await testInstalledBrowser(getConfigProperty('settings.printPdf.browser'), true);
}
let applicationUrl = getConfigProperty('application.applicationUrl');
/**
 * Get the application URL, including the reverse proxy URL prefix if set.
 * @param request The request object
 * @returns The application URL
 */
export function getApplicationUrl(request) {
    if (applicationUrl === undefined || applicationUrl === '') {
        applicationUrl = `http://${request.hostname}${getConfigProperty('application.httpPort') === 80
            ? ''
            : `:${getConfigProperty('application.httpPort')}`}${getConfigProperty('reverseProxy.urlPrefix')}`;
    }
    return applicationUrl;
}
