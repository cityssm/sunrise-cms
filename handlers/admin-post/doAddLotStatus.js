import { addRecord } from '../../database/addRecord.js';
import { getLotStatuses } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const burialSiteStatusId = await addRecord('LotStatuses', request.body.lotStatus, request.body.orderNumber ?? -1, request.session.user);
    const lotStatuses = await getLotStatuses();
    response.json({
        success: true,
        burialSiteStatusId,
        lotStatuses
    });
}
