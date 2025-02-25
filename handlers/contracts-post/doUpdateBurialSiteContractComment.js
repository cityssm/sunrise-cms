import getBurialSiteContractComments from '../../database/getBurialSiteContractComments.js';
import updateBurialSiteContractComment from '../../database/updateBurialSiteContractComment.js';
export default async function handler(request, response) {
    const success = await updateBurialSiteContractComment(request.body, request.session.user);
    const burialSiteContractComments = await getBurialSiteContractComments(request.body.burialSiteContractId);
    response.json({
        success,
        burialSiteContractComments
    });
}
