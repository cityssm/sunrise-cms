import { deleteRecord } from '../../database/deleteRecord.js';
import { getWorkOrderTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('WorkOrderTypes', request.body.workOrderTypeId, request.session.user);
    const workOrderTypes = getWorkOrderTypes();
    response.json({
        success,
        workOrderTypes
    });
}
