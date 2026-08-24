import { addWorkOrderStatus } from '../../database/addRecord.js';
import { getCachedWorkOrderStatuses } from '../../helpers/cache/workOrderStatuses.cache.js';
export default function handler(request, response) {
    const workOrderStatusId = addWorkOrderStatus(request.body.workOrderStatus, request.body.orderNumber ?? -1, request.session.user);
    const workOrderStatuses = getCachedWorkOrderStatuses();
    response.json({
        workOrderStatusId,
        workOrderStatuses
    });
}
