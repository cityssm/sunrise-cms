import { getWorkOrderMilestones } from '../../helpers/lotOccupancyDB/getWorkOrderMilestones.js';
export async function handler(request, response) {
    const workOrderMilestones = await getWorkOrderMilestones(request.body, {
        includeWorkOrders: true,
        orderBy: 'date'
    });
    response.json({
        workOrderMilestones
    });
}
export default handler;
