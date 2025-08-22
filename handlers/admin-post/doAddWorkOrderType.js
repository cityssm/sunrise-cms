import { addWorkOrderType } from '../../database/addRecord.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
export default function handler(request, response) {
    const workOrderTypeId = addWorkOrderType(request.body.workOrderType, request.body.orderNumber ?? -1, request.session.user);
    const workOrderTypes = getCachedWorkOrderTypes();
    response.json({
        success: true,
        workOrderTypeId,
        workOrderTypes
    });
}
