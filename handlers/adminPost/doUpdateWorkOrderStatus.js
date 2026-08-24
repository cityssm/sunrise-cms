import { updateWorkOrderStatus } from '../../database/updateRecord.js';
import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js';
export default function handler(request, response) {
    const success = updateWorkOrderStatus(request.body.workOrderStatusId, request.body.workOrderStatus, request.session.user);
    const workOrderStatuses = getCachedWorkOrderStatuses();
    response.json({
        success,
        workOrderStatuses
    });
}
