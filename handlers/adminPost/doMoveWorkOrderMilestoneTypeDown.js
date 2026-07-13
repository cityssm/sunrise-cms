import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getCachedWorkOrderMilestoneTypes } from '../../helpers/cache/workOrderMilestoneTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('WorkOrderMilestoneTypes', request.body.workOrderMilestoneTypeId)
        : moveRecordDown('WorkOrderMilestoneTypes', request.body.workOrderMilestoneTypeId);
    const workOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes();
    response.json({
        success,
        workOrderMilestoneTypes
    });
}
