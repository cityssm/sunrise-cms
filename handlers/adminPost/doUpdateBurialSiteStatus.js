import { updateBurialSiteStatus } from '../../database/updateRecord.js';
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
export default function handler(request, response) {
    const success = updateBurialSiteStatus(request.body.burialSiteStatusId, request.body.burialSiteStatus, request.session.user);
    const burialSiteStatuses = getCachedBurialSiteStatuses();
    response.json({
        success,
        burialSiteStatuses
    });
}
