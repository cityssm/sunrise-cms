import getBurialSite from '../../database/getBurialSite.js';
import { getNextBurialSiteId, getPreviousBurialSiteId } from '../../helpers/burialSites.helpers.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function handler(request, response) {
    const burialSite = await getBurialSite(request.params.burialSiteId);
    if (burialSite === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/burialSites/?error=burialSiteIdNotFound`);
        return;
    }
    response.render('burialSite-view', {
        headTitle: burialSite.burialSiteName,
        burialSite
    });
    response.on('finish', () => {
        void getNextBurialSiteId(burialSite.burialSiteId);
        void getPreviousBurialSiteId(burialSite.burialSiteId);
    });
}
