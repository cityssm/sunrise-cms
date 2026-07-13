import { updateWorkOrderMilestoneType } from '../../database/updateRecord.js';
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js';
export default function handler(request, response) {
    const success = updateWorkOrderMilestoneType(request.body.workOrderMilestoneTypeId, request.body.workOrderMilestoneType, request.session.user);
    const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes();
    response.json({
        success,
        workOrderMilestoneTypes
    });
}
