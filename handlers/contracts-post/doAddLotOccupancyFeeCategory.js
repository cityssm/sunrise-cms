import addLotOccupancyFeeCategory from '../../database/addLotOccupancyFeeCategory.js';
import getLotOccupancyFees from '../../database/getLotOccupancyFees.js';
export default async function handler(request, response) {
    await addLotOccupancyFeeCategory(request.body, request.session.user);
    const lotOccupancyFees = await getLotOccupancyFees(request.body.burialSiteContractId);
    response.json({
        success: true,
        lotOccupancyFees
    });
}
