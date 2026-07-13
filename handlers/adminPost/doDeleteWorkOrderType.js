import { deleteRecord } from '../../database/deleteRecord.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('WorkOrderTypes', request.body.workOrderTypeId, request.session.user);
    const workOrderTypes = getCachedWorkOrderTypes();
    response.json({
        success,
        workOrderTypes
    });
}
