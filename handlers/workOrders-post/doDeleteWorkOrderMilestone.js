import { deleteRecord } from '../../database/deleteRecord.js';
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js';
export default async function handler(request, response) {
    const success = deleteRecord('WorkOrderMilestones', request.body.workOrderMilestoneId, request.session.user);
    const workOrderMilestones = await getWorkOrderMilestones({
        workOrderId: request.body.workOrderId
    }, {
        orderBy: 'completion'
    });
    response.json({
        success,
        workOrderMilestones
    });
}
