import getBurialSiteContractFees from '../../database/getBurialSiteContractFees.js';
import updateBurialSiteContractFeeQuantity from '../../database/updateBurialSiteContractFeeQuantity.js';
export default async function handler(request, response) {
    const success = await updateBurialSiteContractFeeQuantity(request.body, request.session.user);
    const burialSiteContractFees = await getBurialSiteContractFees(request.body.burialSiteContractId);
    response.json({
        success,
        burialSiteContractFees
    });
}
