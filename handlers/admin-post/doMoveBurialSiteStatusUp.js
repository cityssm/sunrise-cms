import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getBurialSiteStatuses } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordUpToTop('BurialSiteStatuses', request.body.burialSiteStatusId)
        : moveRecordUp('BurialSiteStatuses', request.body.burialSiteStatusId);
    const burialSiteStatuses = getBurialSiteStatuses();
    response.json({
        success,
        burialSiteStatuses
    });
}
