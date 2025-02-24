import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getLotStatuses } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveRecordUpToTop('LotStatuses', request.body.burialSiteStatusId)
        : await moveRecordUp('LotStatuses', request.body.burialSiteStatusId);
    const lotStatuses = await getLotStatuses();
    response.json({
        success,
        lotStatuses
    });
}
