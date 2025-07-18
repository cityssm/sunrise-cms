import addRecord from '../../database/addRecord.js';
import { getWorkOrderTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const workOrderTypeId = addRecord('WorkOrderTypes', request.body.workOrderType, request.body.orderNumber ?? -1, request.session.user);
    const workOrderTypes = getWorkOrderTypes();
    response.json({
        success: true,
        workOrderTypeId,
        workOrderTypes
    });
}
