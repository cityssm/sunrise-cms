import getCemeteries from '../../database/getCemeteries.js';
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
export default function handler(request, response) {
    const cemeteries = getCemeteries();
    const burialSiteTypes = getCachedBurialSiteTypes();
    const burialSiteStatuses = getCachedBurialSiteStatuses();
    response.render('burialSites/gpsCapture', {
        headTitle: 'GPS Coordinate Capture',
        burialSiteStatuses,
        burialSiteTypes,
        cemeteries,
        cemeteryId: request.query.cemeteryId,
        burialSiteTypeId: request.query.burialSiteTypeId
    });
}
