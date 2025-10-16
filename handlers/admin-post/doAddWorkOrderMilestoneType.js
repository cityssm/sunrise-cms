import { addWorkOrderMilestoneType } from '../../database/addRecord.js';
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js';
export default function handler(request, response) {
    const workOrderMilestoneTypeId = addWorkOrderMilestoneType(request.body.workOrderMilestoneType, request.body.orderNumber ?? -1, request.session.user);
    const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes();
    response.json({
        success: true,
        workOrderMilestoneTypeId,
        workOrderMilestoneTypes
    });
}
