import getLotOccupancyFees from '../../database/getLotOccupancyFees.js';
import updateLotOccupancyFeeQuantity from '../../database/updateLotOccupancyFeeQuantity.js';
export default async function handler(request, response) {
    const success = await updateLotOccupancyFeeQuantity(request.body, request.session.user);
    const lotOccupancyFees = await getLotOccupancyFees(request.body.lotOccupancyId);
    response.json({
        success,
        lotOccupancyFees
    });
}
