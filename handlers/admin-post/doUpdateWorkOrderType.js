import { updateRecord } from '../../database/updateRecord.js';
import { getWorkOrderTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = updateRecord('WorkOrderTypes', request.body.workOrderTypeId, request.body.workOrderType, request.session.user);
    const workOrderTypes = getWorkOrderTypes();
    response.json({
        success,
        workOrderTypes
    });
}
