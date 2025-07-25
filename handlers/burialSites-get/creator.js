import getCemeteries from '../../database/getCemeteries.js';
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
export default function handler(request, response) {
    const cemeteries = getCemeteries();
    const burialSiteTypes = getCachedBurialSiteTypes();
    const burialSiteStatuses = getCachedBurialSiteStatuses();
    response.render('burialSite-creator', {
        headTitle: 'Burial Site Range Creator',
        burialSiteStatuses,
        burialSiteTypes,
        cemeteries
    });
}
