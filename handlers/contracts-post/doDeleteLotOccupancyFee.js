import deleteLotOccupancyFee from '../../database/deleteLotOccupancyFee.js';
import getLotOccupancyFees from '../../database/getLotOccupancyFees.js';
export default async function handler(request, response) {
    const success = await deleteLotOccupancyFee(request.body.lotOccupancyId, request.body.feeId, request.session.user);
    const lotOccupancyFees = await getLotOccupancyFees(request.body.lotOccupancyId);
    response.json({
        success,
        lotOccupancyFees
    });
}
