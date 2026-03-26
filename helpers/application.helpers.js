import { getConfigProperty } from './config.helpers.js';
let applicationUrl = getConfigProperty('application.applicationUrl');
export function getApplicationUrl(request) {
    if (applicationUrl === undefined || applicationUrl === '') {
        applicationUrl = `http://${request.hostname}${getConfigProperty('application.httpPort') === 80
            ? ''
            : `:${getConfigProperty('application.httpPort')}`}${getConfigProperty('reverseProxy.urlPrefix')}`;
    }
    return applicationUrl;
}
