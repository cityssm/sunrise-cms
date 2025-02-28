import getContract from '../../database/getContract.js';
import getFeeCategories from '../../database/getFeeCategories.js';
export default async function handler(request, response) {
    const contractId = request.body.contractId;
    const contract = (await getContract(contractId));
    const feeCategories = await getFeeCategories({
        contractTypeId: contract.contractTypeId,
        burialSiteTypeId: contract.burialSiteTypeId
    }, {
        includeFees: true
    });
    response.json({
        feeCategories
    });
}
