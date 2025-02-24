import getLots from '../../database/getLots.js';
import { updateLotStatus } from '../../database/updateLot.js';
export default async function handler(request, response) {
    const success = await updateLotStatus(request.body.lotId, request.body.burialSiteStatusId, request.session.user);
    const workOrderLotsResults = await getLots({
        workOrderId: request.body.workOrderId
    }, {
        limit: -1,
        offset: 0,
        includeLotOccupancyCount: true
    });
    response.json({
        success,
        workOrderLots: workOrderLotsResults.lots
    });
}
