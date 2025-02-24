import copyLotOccupancy from '../../database/copyLotOccupancy.js';
export default async function handler(request, response) {
    const burialSiteContractId = await copyLotOccupancy(request.body.burialSiteContractId, request.session.user);
    response.json({
        success: true,
        burialSiteContractId
    });
}
