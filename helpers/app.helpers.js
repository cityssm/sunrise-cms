import { getConfigProperty } from './config.helpers.js';
let appUrl = getConfigProperty('application.appUrl');
export function getAppUrl(request) {
    if (appUrl === undefined || appUrl === '') {
        appUrl = `http://${request.hostname}${getConfigProperty('application.httpPort') === 80
            ? ''
            : `:${getConfigProperty('application.httpPort')}`}${getConfigProperty('reverseProxy.urlPrefix')}`;
    }
    return appUrl;
}
