import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveRecordDownToBottom('OccupancyTypes', request.body.contractTypeId)
        : await moveRecordDown('OccupancyTypes', request.body.contractTypeId);
    const occupancyTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success,
        occupancyTypes,
        allContractTypeFields
    });
}
