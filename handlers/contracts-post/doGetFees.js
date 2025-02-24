import getFeeCategories from '../../database/getFeeCategories.js';
import getLotOccupancy from '../../database/getLotOccupancy.js';
export default async function handler(request, response) {
    const burialSiteContractId = request.body.burialSiteContractId;
    const lotOccupancy = (await getLotOccupancy(burialSiteContractId));
    const feeCategories = await getFeeCategories({
        contractTypeId: lotOccupancy.contractTypeId,
        burialSiteTypeId: lotOccupancy.burialSiteTypeId
    }, {
        includeFees: true
    });
    response.json({
        feeCategories
    });
}
