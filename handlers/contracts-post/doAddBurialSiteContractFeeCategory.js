import addBurialSiteContractFeeCategory from '../../database/addBurialSiteContractFeeCategory.js';
import getBurialSiteContractFees from '../../database/getBurialSiteContractFees.js';
export default async function handler(request, response) {
    await addBurialSiteContractFeeCategory(request.body, request.session.user);
    const burialSiteContractFees = await getBurialSiteContractFees(request.body.burialSiteContractId);
    response.json({
        success: true,
        burialSiteContractFees
    });
}
