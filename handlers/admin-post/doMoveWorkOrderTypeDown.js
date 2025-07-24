import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('WorkOrderTypes', request.body.workOrderTypeId)
        : moveRecordDown('WorkOrderTypes', request.body.workOrderTypeId);
    const workOrderTypes = getCachedWorkOrderTypes();
    response.json({
        success,
        workOrderTypes
    });
}
