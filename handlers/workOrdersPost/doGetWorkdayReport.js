import { getWorkOrders } from '../../database/getWorkOrders.js';
export default async function handler(request, response) {
    const result = await getWorkOrders({
        workOrderMilestoneDateString: request.body.workdayDateString
    }, {
        limit: -1,
        offset: 0,
        includeBurialSites: true,
        includeMilestones: true
    });
    response.json({
        workOrders: result.workOrders
    });
}
