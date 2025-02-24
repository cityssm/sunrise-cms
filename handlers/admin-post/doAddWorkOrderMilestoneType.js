import addRecord from '../../database/addRecord.js';
import { getWorkOrderMilestoneTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const workOrderMilestoneTypeId = await addRecord('WorkOrderMilestoneTypes', request.body.workOrderMilestoneType, request.body.orderNumber ?? -1, request.session.user);
    const workOrderMilestoneTypes = await getWorkOrderMilestoneTypes();
    response.json({
        success: true,
        workOrderMilestoneTypeId,
        workOrderMilestoneTypes
    });
}
