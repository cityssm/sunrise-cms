import { updateRecord } from '../../database/updateRecord.js';
import { getWorkOrderMilestoneTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = updateRecord('WorkOrderMilestoneTypes', request.body.workOrderMilestoneTypeId, request.body.workOrderMilestoneType, request.session.user);
    const workOrderMilestoneTypes = getWorkOrderMilestoneTypes();
    response.json({
        success,
        workOrderMilestoneTypes
    });
}
