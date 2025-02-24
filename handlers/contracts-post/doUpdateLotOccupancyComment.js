import getLotOccupancyComments from '../../database/getLotOccupancyComments.js';
import updateLotOccupancyComment from '../../database/updateLotOccupancyComment.js';
export default async function handler(request, response) {
    const success = await updateLotOccupancyComment(request.body, request.session.user);
    const lotOccupancyComments = await getLotOccupancyComments(request.body.burialSiteContractId);
    response.json({
        success,
        lotOccupancyComments
    });
}
