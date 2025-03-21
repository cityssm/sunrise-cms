import updateBurialSite from '../../database/updateBurialSite.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default async function handler(request, response) {
    try {
        const success = await updateBurialSite(request.body, request.session.user);
        const burialSiteId = typeof request.body.burialSiteId === 'string'
            ? Number.parseInt(request.body.burialSiteId, 10)
            : request.body.burialSiteId;
        response.json({
            success,
            burialSiteId
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
