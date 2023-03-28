import { deleteWorkOrderLot } from '../../helpers/lotOccupancyDB/deleteWorkOrderLot.js';
import { getLots } from '../../helpers/lotOccupancyDB/getLots.js';
export async function handler(request, response) {
    const success = await deleteWorkOrderLot(request.body.workOrderId, request.body.lotId, request.session);
    const workOrderLotsResults = await getLots({
        workOrderId: request.body.workOrderId
    }, {
        limit: -1,
        offset: 0,
        includeLotOccupancyCount: false
    });
    response.json({
        success,
        workOrderLots: workOrderLotsResults.lots
    });
}
export default handler;
