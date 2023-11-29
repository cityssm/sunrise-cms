import { deleteWorkOrderLotOccupancy } from '../../helpers/lotOccupancyDB/deleteWorkOrderLotOccupancy.js';
import { getLotOccupancies } from '../../helpers/lotOccupancyDB/getLotOccupancies.js';
export async function handler(request, response) {
    const success = await deleteWorkOrderLotOccupancy(request.body.workOrderId, request.body.lotOccupancyId, request.session.user);
    const workOrderLotOccupancies = await getLotOccupancies({
        workOrderId: request.body.workOrderId
    }, {
        limit: -1,
        offset: 0,
        includeOccupants: true,
        includeFees: false,
        includeTransactions: false
    });
    response.json({
        success,
        workOrderLotOccupancies: workOrderLotOccupancies.lotOccupancies
    });
}
export default handler;
