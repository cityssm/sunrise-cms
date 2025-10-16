import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getCachedWorkOrderTypes } from '../../helpers/cache/workOrderTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordUpToTop('WorkOrderTypes', request.body.workOrderTypeId)
        : moveRecordUp('WorkOrderTypes', request.body.workOrderTypeId);
    const workOrderTypes = getCachedWorkOrderTypes();
    response.json({
        success,
        workOrderTypes
    });
}
