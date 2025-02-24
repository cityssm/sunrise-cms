import { deleteRecord } from '../../database/deleteRecord.js';
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = await deleteRecord('BurialSiteStatuses', request.body.burialSiteStatusId, request.session.user);
    const burialSiteStatuses = await getBurialSiteStatuses();
    response.json({
        success,
        burialSiteStatuses
    });
}
