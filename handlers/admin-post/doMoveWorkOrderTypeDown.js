import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getWorkOrderTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('WorkOrderTypes', request.body.workOrderTypeId)
        : moveRecordDown('WorkOrderTypes', request.body.workOrderTypeId);
    const workOrderTypes = getWorkOrderTypes();
    response.json({
        success,
        workOrderTypes
    });
}
