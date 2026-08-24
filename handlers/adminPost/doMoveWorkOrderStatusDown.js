import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('WorkOrderStatuses', request.body.workOrderStatusId)
        : moveRecordDown('WorkOrderStatuses', request.body.workOrderStatusId);
    const workOrderStatuses = getCachedWorkOrderStatuses();
    response.json({
        success,
        workOrderStatuses
    });
}
