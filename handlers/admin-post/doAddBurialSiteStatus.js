import addRecord from '../../database/addRecord.js';
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const burialSiteStatusId = addRecord('BurialSiteStatuses', request.body.burialSiteStatus, request.body.orderNumber ?? -1, request.session.user);
    const burialSiteStatuses = getBurialSiteStatuses();
    response.json({
        success: true,
        burialSiteStatuses,
        burialSiteStatusId
    });
}
