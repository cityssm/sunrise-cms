import deleteBurialSiteContractFee from '../../database/deleteBurialSiteContractFee.js';
import getBurialSiteContractFees from '../../database/getBurialSiteContractFees.js';
export default async function handler(request, response) {
    const success = await deleteBurialSiteContractFee(request.body.burialSiteContractId, request.body.feeId, request.session.user);
    const burialSiteContractFees = await getBurialSiteContractFees(request.body.burialSiteContractId);
    response.json({
        success,
        burialSiteContractFees
    });
}
