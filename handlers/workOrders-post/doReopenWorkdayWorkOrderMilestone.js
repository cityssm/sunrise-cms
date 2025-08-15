import getWorkOrders from '../../database/getWorkOrders.js';
import reopenWorkOrderMilestone from '../../database/reopenWorkOrderMilestone.js';
export default async function handler(request, response) {
    const success = reopenWorkOrderMilestone(request.body.workOrderMilestoneId, request.session.user);
    const result = await getWorkOrders({
        workOrderMilestoneDateString: request.body.workdayDateString
    }, {
        limit: -1,
        offset: 0,
        includeBurialSites: true,
        includeMilestones: true
    });
    response.json({
        success,
        workOrders: result.workOrders
    });
}
