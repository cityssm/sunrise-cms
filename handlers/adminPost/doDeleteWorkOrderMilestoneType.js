import { deleteRecord } from '../../database/deleteRecord.js';
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('WorkOrderMilestoneTypes', request.body.workOrderMilestoneTypeId, request.session.user);
    const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes();
    response.json({
        success,
        workOrderMilestoneTypes
    });
}
