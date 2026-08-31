import getPreviousCemeteryId from '../../database/getPreviousCemeteryId.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(request, response) {
    const cemeteryId = Math.trunc(Number(request.params.cemeteryId));
    const previousCemeteryId = getPreviousCemeteryId(cemeteryId);
    if (previousCemeteryId === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/cemeteries/?error=noPreviousCemeteryIdFound`);
        return;
    }
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/cemeteries/${previousCemeteryId.toString()}`);
}
