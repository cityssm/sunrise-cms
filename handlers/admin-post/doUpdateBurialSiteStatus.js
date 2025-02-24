import { updateRecord } from '../../database/updateRecord.js';
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = await updateRecord('BurialSiteStatuses', request.body.burialSiteStatusId, request.body.burialSiteStatus, request.session.user);
    const burialSiteStatuses = await getBurialSiteStatuses();
    response.json({
        success,
        burialSiteStatuses
    });
}
