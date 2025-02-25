import getBurialSiteContractFees from '../../database/getBurialSiteContractFees.js';
import updateLotOccupancyFeeQuantity from '../../database/updateLotOccupancyFeeQuantity.js';
export default async function handler(request, response) {
    const success = await updateLotOccupancyFeeQuantity(request.body, request.session.user);
    const burialSiteContractFees = await getBurialSiteContractFees(request.body.burialSiteContractId);
    response.json({
        success,
        burialSiteContractFees
    });
}
