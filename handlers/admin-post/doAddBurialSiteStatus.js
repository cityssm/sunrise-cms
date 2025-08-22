import { addBurialSiteStatus } from '../../database/addRecord.js';
import { getCachedBurialSiteStatuses } from '../../helpers/cache/burialSiteStatuses.cache.js';
export default function handler(request, response) {
    const burialSiteStatusId = addBurialSiteStatus(request.body.burialSiteStatus, request.body.orderNumber ?? -1, request.session.user);
    const burialSiteStatuses = getCachedBurialSiteStatuses();
    response.json({
        success: true,
        burialSiteStatuses,
        burialSiteStatusId
    });
}
