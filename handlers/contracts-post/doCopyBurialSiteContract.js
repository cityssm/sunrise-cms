import copyBurialSiteContract from '../../database/copyBurialSiteContract.js';
export default async function handler(request, response) {
    const burialSiteContractId = await copyBurialSiteContract(request.body.burialSiteContractId, request.session.user);
    response.json({
        success: true,
        burialSiteContractId
    });
}
