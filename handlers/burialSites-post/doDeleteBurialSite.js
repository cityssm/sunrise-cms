import { deleteBurialSite } from '../../database/deleteBurialSite.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default async function handler(request, response) {
    const burialSiteId = Number.parseInt(request.body.burialSiteId, 10);
    const success = await deleteBurialSite(burialSiteId, request.session.user);
    response.json({
        errorMessage: success
            ? ''
            : 'Note that burial sites with active contracts cannot be deleted.',
        success
    });
    if (success) {
        response.on('finish', () => {
            clearNextPreviousBurialSiteIdCache(burialSiteId);
        });
    }
}
