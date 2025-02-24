import addLotOccupancyComment from '../../database/addLotOccupancyComment.js';
import getLotOccupancyComments from '../../database/getLotOccupancyComments.js';
export default async function handler(request, response) {
    await addLotOccupancyComment(request.body, request.session.user);
    const lotOccupancyComments = await getLotOccupancyComments(request.body.burialSiteContractId);
    response.json({
        success: true,
        lotOccupancyComments
    });
}
