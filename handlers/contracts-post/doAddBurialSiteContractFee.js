import addBurialSiteContractFee from '../../database/addBurialSiteContractFee.js';
import getBurialSiteContractFees from '../../database/getBurialSiteContractFees.js';
export default async function handler(request, response) {
    await addBurialSiteContractFee(request.body, request.session.user);
    const burialSiteContractFees = await getBurialSiteContractFees(request.body.burialSiteContractId);
    response.json({
        success: true,
        burialSiteContractFees
    });
}
