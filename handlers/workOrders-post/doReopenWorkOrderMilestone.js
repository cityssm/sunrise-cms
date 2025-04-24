import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js';
import reopenWorkOrderMilestone from '../../database/reopenWorkOrderMilestone.js';
export default async function handler(request, response) {
    const success = reopenWorkOrderMilestone(request.body.workOrderMilestoneId, request.session.user);
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
