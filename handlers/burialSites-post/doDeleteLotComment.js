import { deleteRecord } from '../../database/deleteRecord.js';
import getLotComments from '../../database/getLotComments.js';
export default async function handler(request, response) {
    const success = await deleteRecord('LotComments', request.body.lotCommentId, request.session.user);
    const lotComments = await getLotComments(request.body.lotId);
    response.json({
        success,
        lotComments
    });
}
