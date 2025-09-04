import getBurialSite from '../../database/getBurialSite.js';
import getCemeteries from '../../database/getCemeteries.js';
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getBurialSiteImages } from '../../helpers/images.helpers.js';
export default async function handler(request, response) {
    const burialSite = await getBurialSite(request.params.burialSiteId);
    if (burialSite === undefined) {
        response.redirect(`${getConfigProperty('reverseProxy.urlPrefix')}/burialSites/?error=burialSiteIdNotFound`);
        return;
    }
    const cemeteries = getCemeteries();
    const burialSiteImages = await getBurialSiteImages();
    const burialSiteTypes = getCachedBurialSiteTypes();
    const burialSiteStatuses = getCachedBurialSiteStatuses();
    response.render('burialSites/edit', {
        headTitle: burialSite.burialSiteName,
        burialSite,
        isCreate: false,
        burialSiteImages,
        burialSiteStatuses,
        burialSiteTypes,
        cemeteries
    });
}
