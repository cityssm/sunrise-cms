import getBurialSite from '../../database/getBurialSite.js';
import getCemeteries from '../../database/getCemeteries.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getBurialSiteStatuses, getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const burialSite = await getBurialSite(request.params.burialSiteId);
    if (burialSite === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/burialSites/?error=burialSiteIdNotFound`);
        return;
    }
    const cemeteries = await getCemeteries();
    const burialSiteTypes = await getBurialSiteTypes();
    const burialSiteStatuses = await getBurialSiteStatuses();
    response.render('burialSite-edit', {
        headTitle: burialSite.burialSiteName,
        burialSite,
        isCreate: false,
        cemeteries,
        burialSiteTypes,
        burialSiteStatuses
    });
}
