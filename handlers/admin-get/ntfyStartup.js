import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(_request, response) {
    if (getConfigProperty('application.ntfyStartup') === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/dashboard/?error=ntfyNotConfigured`);
        return;
    }
    response.render('admin-ntfyStartup', {
        headTitle: 'Ntfy Startup Notification'
    });
}
