import updateBurialSiteContract from '../../database/updateBurialSiteContract.js';
export default async function handler(request, response) {
    const success = await updateBurialSiteContract(request.body, request.session.user);
    response.json({
        success,
        burialSiteContractId: request.body.burialSiteContractId
    });
}
