import { updateRecord } from '../../database/updateRecord.js';
import { getBurialSiteStatuses } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = updateRecord('BurialSiteStatuses', request.body.burialSiteStatusId, request.body.burialSiteStatus, request.session.user);
    const burialSiteStatuses = getBurialSiteStatuses();
    response.json({
        success,
        burialSiteStatuses
    });
}
