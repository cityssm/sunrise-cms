import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('BurialSiteStatuses', request.body.burialSiteStatusId)
        : moveRecordDown('BurialSiteStatuses', request.body.burialSiteStatusId);
    const burialSiteStatuses = getBurialSiteStatuses();
    response.json({
        success,
        burialSiteStatuses
    });
}
