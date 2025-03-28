import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveRecordDownToBottom('BurialSiteStatuses', request.body.burialSiteStatusId)
        : await moveRecordDown('BurialSiteStatuses', request.body.burialSiteStatusId);
    const burialSiteStatuses = await getBurialSiteStatuses();
    response.json({
        success,
        burialSiteStatuses
    });
}
