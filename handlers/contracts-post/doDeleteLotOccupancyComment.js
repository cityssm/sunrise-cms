import { deleteRecord } from '../../database/deleteRecord.js';
import getLotOccupancyComments from '../../database/getLotOccupancyComments.js';
export default async function handler(request, response) {
    const success = await deleteRecord('LotOccupancyComments', request.body.burialSiteContractCommentId, request.session.user);
    const lotOccupancyComments = await getLotOccupancyComments(request.body.burialSiteContractId);
    response.json({
        success,
        lotOccupancyComments
    });
}
