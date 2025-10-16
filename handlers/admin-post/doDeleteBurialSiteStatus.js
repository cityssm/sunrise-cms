import { deleteRecord } from '../../database/deleteRecord.js';
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('BurialSiteStatuses', request.body.burialSiteStatusId, request.session.user);
    const burialSiteStatuses = getCachedBurialSiteStatuses();
    response.json({
        success,
        burialSiteStatuses
    });
}
