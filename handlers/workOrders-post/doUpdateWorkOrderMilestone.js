import { getWorkOrderMilestones } from '../../database/getWorkOrderMilestones.js';
import { updateWorkOrderMilestone } from '../../database/updateWorkOrderMilestone.js';
export async function handler(request, response) {
    const success = await updateWorkOrderMilestone(request.body, request.session.user);
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
export default handler;
