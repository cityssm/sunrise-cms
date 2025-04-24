import getWorkOrderComments from '../../database/getWorkOrderComments.js';
import updateWorkOrderComment from '../../database/updateWorkOrderComment.js';
export default function handler(request, response) {
    const success = updateWorkOrderComment(request.body, request.session.user);
    const workOrderComments = getWorkOrderComments(request.body.workOrderId);
    response.json({
        success,
        workOrderComments
    });
}
