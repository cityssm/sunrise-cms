import { updateRecord } from '../../database/updateRecord.js';
import { getLotStatuses } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = await updateRecord('LotStatuses', request.body.burialSiteStatusId, request.body.lotStatus, request.session.user);
    const lotStatuses = await getLotStatuses();
    response.json({
        success,
        lotStatuses
    });
}
