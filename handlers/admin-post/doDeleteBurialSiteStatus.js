import { deleteRecord } from '../../database/deleteRecord.js';
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('BurialSiteStatuses', request.body.burialSiteStatusId, request.session.user);
    const burialSiteStatuses = getBurialSiteStatuses();
    response.json({
        success,
        burialSiteStatuses
    });
}
