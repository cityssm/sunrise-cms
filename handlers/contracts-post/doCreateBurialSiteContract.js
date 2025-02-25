import addBurialSiteContract from '../../database/addBurialSiteContract.js';
export default async function handler(request, response) {
    const burialSiteContractId = await addBurialSiteContract(request.body, request.session.user);
    response.json({
        success: true,
        burialSiteContractId
    });
}
