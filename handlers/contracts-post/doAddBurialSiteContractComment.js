import addBurialSiteContractComment from '../../database/addBurialSiteContractComment.js';
import getBurialSiteContractComments from '../../database/getBurialSiteContractComments.js';
export default async function handler(request, response) {
    await addBurialSiteContractComment(request.body, request.session.user);
    const burialSiteContractComments = await getBurialSiteContractComments(request.body.burialSiteContractId);
    response.json({
        success: true,
        burialSiteContractComments
    });
}
