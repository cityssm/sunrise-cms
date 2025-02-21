import { deleteRecord } from '../../database/deleteRecord.js';
import getLotOccupancyComments from '../../database/getLotOccupancyComments.js';
export default async function handler(request, response) {
    const success = await deleteRecord('LotOccupancyComments', request.body.lotOccupancyCommentId, request.session.user);
    const lotOccupancyComments = await getLotOccupancyComments(request.body.lotOccupancyId);
    response.json({
        success,
        lotOccupancyComments
    });
}
