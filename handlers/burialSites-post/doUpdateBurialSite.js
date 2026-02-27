import updateBurialSite from '../../database/updateBurialSite.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default function handler(request, response) {
    try {
        const success = updateBurialSite(request.body, request.session.user);
        const burialSiteId = typeof request.body.burialSiteId === 'string'
            ? Number.parseInt(request.body.burialSiteId, 10)
            : request.body.burialSiteId;
        response.json({
            success,
            burialSiteId,
            errorMessage: success ? '' : 'Failed to update burial site'
        });
        response.on('finish', () => {
            clearNextPreviousBurialSiteIdCache(burialSiteId);
        });
    }
    catch (error) {
        response.json({
            success: false,
            errorMessage: error.message
        });
    }
}
