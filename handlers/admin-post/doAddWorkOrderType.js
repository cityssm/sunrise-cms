import addRecord from '../../database/addRecord.js';
import { getWorkOrderTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const workOrderTypeId = await addRecord('WorkOrderTypes', request.body.workOrderType, request.body.orderNumber ?? -1, request.session.user);
    const workOrderTypes = await getWorkOrderTypes();
    response.json({
        success: true,
        workOrderTypeId,
        workOrderTypes
    });
}
