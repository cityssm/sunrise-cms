import addRecord from '../../database/addRecord.js';
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const burialSiteStatusId = await addRecord('BurialSiteStatuses', request.body.burialSiteStatus, request.body.orderNumber ?? -1, request.session.user);
    const burialSiteStatuses = await getBurialSiteStatuses();
    response.json({
        success: true,
        burialSiteStatuses,
        burialSiteStatusId
    });
}
