import addWorkOrderComment from '../../database/addWorkOrderComment.js';
import getWorkOrderComments from '../../database/getWorkOrderComments.js';
export default function handler(request, response) {
    addWorkOrderComment(request.body, request.session.user);
    const workOrderComments = getWorkOrderComments(request.body.workOrderId);
    response.json({
        success: true,
        workOrderComments
    });
}
