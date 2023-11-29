import { completeWorkOrderMilestone } from '../../helpers/lotOccupancyDB/completeWorkOrderMilestone.js';
import { getWorkOrderMilestones } from '../../helpers/lotOccupancyDB/getWorkOrderMilestones.js';
export async function handler(request, response) {
    const success = await completeWorkOrderMilestone({
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
export default handler;
