import { getPreviousBurialSiteId } from '../../helpers/burialSites.helpers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default function handler(request, response) {
    const burialSiteId = Number.parseInt(request.params.burialSiteId, 10);
    const previousBurialSiteId = getPreviousBurialSiteId(burialSiteId);
    if (previousBurialSiteId === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/burialSites/?error=noPreviousBurialSiteIdFound`);
        return;
    }
    response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/burialSites/${previousBurialSiteId.toString()}`);
}
