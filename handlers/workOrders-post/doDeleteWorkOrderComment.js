import { deleteRecord } from '../../database/deleteRecord.js';
import getWorkOrderComments from '../../database/getWorkOrderComments.js';
export default function handler(request, response) {
    const success = deleteRecord('WorkOrderComments', request.body.workOrderCommentId, request.session.user);
    const workOrderComments = getWorkOrderComments(request.body.workOrderId);
    response.json({
        success,
        workOrderComments
    });
}
