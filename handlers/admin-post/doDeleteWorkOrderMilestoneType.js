import { deleteRecord } from '../../database/deleteRecord.js';
import { getWorkOrderMilestoneTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = deleteRecord('WorkOrderMilestoneTypes', request.body.workOrderMilestoneTypeId, request.session.user);
    const workOrderMilestoneTypes = getWorkOrderMilestoneTypes();
    response.json({
        success,
        workOrderMilestoneTypes
    });
}
