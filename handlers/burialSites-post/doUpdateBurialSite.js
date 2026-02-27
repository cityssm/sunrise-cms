import updateBurialSite from '../../database/updateBurialSite.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default function handler(request, response) {
    try {
        const success = updateBurialSite(request.body, request.session.user);
        if (!success) {
            response
                .status(400)
                .json({ success: false, errorMessage: 'Failed to update burial site' });
            return;
        }
        const burialSiteId = typeof request.body.burialSiteId === 'string'
            ? Number.parseInt(request.body.burialSiteId, 10)
            : request.body.burialSiteId;
        response.on('finish', () => {
            clearNextPreviousBurialSiteIdCache(burialSiteId);
        });
        response.json({
            success,
            burialSiteId
        });
    }
    catch (error) {
        response.json({
            success: false,
            errorMessage: error.message
        });
    }
}
