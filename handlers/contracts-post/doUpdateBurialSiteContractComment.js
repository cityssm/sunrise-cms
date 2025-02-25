import getBurialSiteContractComments from '../../database/getBurialSiteContractComments.js';
import updateLotOccupancyComment from '../../database/updateLotOccupancyComment.js';
export default async function handler(request, response) {
    const success = await updateLotOccupancyComment(request.body, request.session.user);
    const burialSiteContractComments = await getBurialSiteContractComments(request.body.burialSiteContractId);
    response.json({
        success,
        burialSiteContractComments
    });
}
