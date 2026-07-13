import getWorkOrderMilestones from '../../database/getWorkOrderMilestones.js';
export default async function handler(request, response) {
    const workOrderMilestones = await getWorkOrderMilestones(request.body, {
        includeWorkOrders: true,
        orderBy: 'date'
    });
    response.json({
        workOrderMilestones
    });
}
