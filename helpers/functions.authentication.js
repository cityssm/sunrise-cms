import ActiveDirectory from 'activedirectory2';
import { getConfigProperty } from './config.helpers.js';
const userDomain = getConfigProperty('application.userDomain');
const activeDirectoryConfig = getConfigProperty('activeDirectory');
async function authenticateViaActiveDirectory(userName, password) {
    return await new Promise((resolve) => {
        try {
            const ad = new ActiveDirectory(activeDirectoryConfig);
            ad.authenticate(`${userDomain}\\${userName}`, password, (error, auth) => {
                let authenticated = false;
                if ((error ?? '') === '') {
                    authenticated = auth;
                }
                resolve(authenticated);
            });
        }
        catch {
            resolve(false);
        }
    });
}
export async function authenticate(userName, password) {
    if ((userName ?? '') === '' || (password ?? '') === '') {
        return false;
    }
    return await authenticateViaActiveDirectory(userName ?? '', password ?? '');
}
/* eslint-disable @cspell/spellchecker */
const safeRedirects = new Set([
    '/admin/cleanup',
    '/admin/fees',
    '/admin/lottypes',
    '/admin/occupancytypes',
    '/admin/tables',
    '/lotoccupancies',
    '/contracts/new',
    '/lots',
    '/lots/new',
    '/maps',
    '/maps/new',
    '/workorders',
    '/workorders/new',
    '/workorders/milestonecalendar',
    '/workorders/outlook',
    '/reports'
]);
/* eslint-enable @cspell/spellchecker */
const recordUrl = /^\/(?:maps|lots|lotoccupancies|workorders)\/\d+(?:\/edit)?$/;
const printUrl = /^\/print\/(?:pdf|screen)\/[\d/=?A-Za-z-]+$/;
export function getSafeRedirectURL(possibleRedirectURL = '') {
    const urlPrefix = getConfigProperty('reverseProxy.urlPrefix');
    if (typeof possibleRedirectURL === 'string') {
        const urlToCheck = possibleRedirectURL.startsWith(urlPrefix)
            ? possibleRedirectURL.slice(urlPrefix.length)
            : possibleRedirectURL;
        const urlToCheckLowerCase = urlToCheck.toLowerCase();
        if (safeRedirects.has(urlToCheckLowerCase) ||
            recordUrl.test(urlToCheckLowerCase) ||
            printUrl.test(urlToCheck)) {
            return urlPrefix + urlToCheck;
        }
    }
    return `${urlPrefix}/dashboard/`;
}
