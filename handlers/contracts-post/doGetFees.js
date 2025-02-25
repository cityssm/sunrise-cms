import getBurialSiteContract from '../../database/getBurialSiteContract.js';
import getFeeCategories from '../../database/getFeeCategories.js';
export default async function handler(request, response) {
    const burialSiteContractId = request.body.burialSiteContractId;
    const burialSiteContract = (await getBurialSiteContract(burialSiteContractId));
    const feeCategories = await getFeeCategories({
        contractTypeId: burialSiteContract.contractTypeId,
        burialSiteTypeId: burialSiteContract.burialSiteTypeId
    }, {
        includeFees: true
    });
    response.json({
        feeCategories
    });
}
