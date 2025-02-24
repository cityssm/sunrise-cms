import deleteLotOccupancyFee from '../../database/deleteLotOccupancyFee.js';
import getLotOccupancyFees from '../../database/getLotOccupancyFees.js';
export default async function handler(request, response) {
    const success = await deleteLotOccupancyFee(request.body.burialSiteContractId, request.body.feeId, request.session.user);
    const lotOccupancyFees = await getLotOccupancyFees(request.body.burialSiteContractId);
    response.json({
        success,
        lotOccupancyFees
    });
}
