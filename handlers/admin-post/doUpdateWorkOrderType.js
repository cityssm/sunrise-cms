import { updateRecord } from '../../database/updateRecord.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
export default function handler(request, response) {
    const success = updateRecord('WorkOrderTypes', request.body.workOrderTypeId, request.body.workOrderType, request.session.user);
    const workOrderTypes = getCachedWorkOrderTypes();
    response.json({
        success,
        workOrderTypes
    });
}
