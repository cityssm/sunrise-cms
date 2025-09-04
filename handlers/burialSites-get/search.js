import getCemeteries from '../../database/getCemeteries.js';
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
export default function handler(request, response) {
    let error = request.query.error;
    switch (error) {
        case 'burialSiteIdNotFound': {
            error = 'Burial Site ID not found.';
            break;
        }
        case 'noNextBurialSiteIdFound': {
            error = 'No next Burial Site ID found.';
            break;
        }
        case 'noPreviousBurialSiteIdFound': {
            error = 'No previous Burial Site ID found.';
            break;
        }
        // No default
    }
    const cemeteries = getCemeteries();
    const burialSiteTypes = getCachedBurialSiteTypes();
    const burialSiteStatuses = getCachedBurialSiteStatuses();
    response.render('burialSites/search', {
        headTitle: 'Burial Site Search',
        burialSiteStatuses,
        burialSiteTypes,
        cemeteries,
        burialSiteStatusId: request.query.burialSiteStatusId,
        burialSiteTypeId: request.query.burialSiteTypeId,
        cemeteryId: request.query.cemeteryId,
        error
    });
}
