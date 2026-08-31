import { restoreBurialSite } from '../../database/restoreBurialSite.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default function handler(request, response) {
    const success = restoreBurialSite(request.body.burialSiteId, request.session.user);
    const burialSiteId = typeof request.body.burialSiteId === 'string'
        ? Math.trunc(Number(request.body.burialSiteId))
        : request.body.burialSiteId;
    response.json({
        success,
        burialSiteId
    });
    if (success) {
        response.on('finish', () => {
            clearNextPreviousBurialSiteIdCache();
        });
    }
}
