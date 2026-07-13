import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js';
import { i18next } from '../../helpers/i18n.helpers.js';
export default function handler(request, response) {
    const cemeteries = getCachedCemeteries();
    const burialSiteTypes = getCachedBurialSiteTypes();
    const burialSiteStatuses = getCachedBurialSiteStatuses();
    response.render('burialSites/creator', {
        headTitle: i18next.t('cemeteries.burialSiteRangeCreator', { lng: response.locals.lng }),
        burialSiteStatuses,
        burialSiteTypes,
        cemeteries
    });
}
