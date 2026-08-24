import { deleteRecord } from '../../database/deleteRecord.js';
import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('WorkOrderStatuses', request.body.workOrderStatusId, request.session.user);
    const workOrderStatuses = getCachedWorkOrderStatuses();
    response.json({
        success,
        workOrderStatuses
    });
}
