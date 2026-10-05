import addBurialSite from '../../database/addBurialSite.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js';
export default function handler(request, response) {
    try {
        const burialSite = addBurialSite(request.body, request.session.user);
        response.json({
            success: true,
            burialSiteId: burialSite.burialSiteId,
            burialSiteName: burialSite.burialSiteName
        });
        response.on('finish', () => {
            clearNextPreviousBurialSiteIdCache();
            getCachedCemeteries();
        });
    }
    catch (error) {
        response.json({
            success: false,
            errorMessage: error.message
        });
    }
}
