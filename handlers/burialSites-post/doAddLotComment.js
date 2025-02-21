import addLotComment from '../../database/addLotComment.js';
import getLotComments from '../../database/getLotComments.js';
export default async function handler(request, response) {
    await addLotComment(request.body, request.session.user);
    const lotComments = await getLotComments(request.body.lotId);
    response.json({
        success: true,
        lotComments
    });
}
