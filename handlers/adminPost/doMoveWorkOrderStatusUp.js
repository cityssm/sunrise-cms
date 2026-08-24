import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordUpToTop('WorkOrderStatuses', request.body.workOrderStatusId)
        : moveRecordUp('WorkOrderStatuses', request.body.workOrderStatusId);
    const workOrderStatuses = getCachedWorkOrderStatuses();
    response.json({
        success,
        workOrderStatuses
    });
}
