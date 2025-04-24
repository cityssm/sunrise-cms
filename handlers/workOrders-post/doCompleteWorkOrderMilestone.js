import completeWorkOrderMilestone from '../../database/completeWorkOrderMilestone.js';
import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js';
export default async function handler(request, response) {
    const success = completeWorkOrderMilestone({
        workOrderMilestoneId: request.body.workOrderMilestoneId
    }, request.session.user);
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
