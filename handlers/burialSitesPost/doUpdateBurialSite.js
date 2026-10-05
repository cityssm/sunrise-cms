import updateBurialSite from '../../database/updateBurialSite.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
import { getCachedCemeteries } from '../../helpers/cache/cemeteries.cache.js';
export default function handler(request, response) {
    try {
        const success = updateBurialSite(request.body, request.session.user);
        if (!success) {
            response.status(400).json({
                success: false,
                errorMessage: 'Failed to update burial site'
            });
            return;
        }
        const burialSiteId = typeof request.body.burialSiteId === 'string'
            ? Math.trunc(Number(request.body.burialSiteId))
            : request.body.burialSiteId;
        response.json({
            success,
            burialSiteId
        });
        response.on('finish', () => {
            clearNextPreviousBurialSiteIdCache(burialSiteId);
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
