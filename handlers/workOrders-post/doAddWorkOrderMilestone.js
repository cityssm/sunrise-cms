import addWorkOrderMilestone from '../../database/addWorkOrderMilestone.js';
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js';
export default async function handler(request, response) {
    const success = addWorkOrderMilestone(request.body, request.session.user);
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
