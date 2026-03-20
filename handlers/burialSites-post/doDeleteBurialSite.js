import { deleteBurialSite } from '../../database/deleteBurialSite.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default function handler(request, response) {
    const burialSiteId = Number.parseInt(request.body.burialSiteId, 10);
    const success = deleteBurialSite(burialSiteId, request.session.user);
    if (!success) {
        response.status(400).json({
            errorMessage: 'Note that burial sites with active contracts cannot be deleted.',
            success: false
        });
        return;
    }
    response.on('finish', () => {
        clearNextPreviousBurialSiteIdCache(burialSiteId);
    });
    response.json({
        success
    });
}
