import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getBurialSiteStatuses } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveRecordUpToTop('BurialSiteStatuses', request.body.burialSiteStatusId)
        : await moveRecordUp('BurialSiteStatuses', request.body.burialSiteStatusId);
    const burialSiteStatuses = await getBurialSiteStatuses();
    response.json({
        success,
        burialSiteStatuses
    });
}
