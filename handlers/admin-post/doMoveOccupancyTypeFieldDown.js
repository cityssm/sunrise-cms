import { moveOccupancyTypeFieldDown, moveOccupancyTypeFieldDownToBottom } from '../../database/moveOccupancyTypeField.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveOccupancyTypeFieldDownToBottom(request.body.contractTypeFieldId)
        : await moveOccupancyTypeFieldDown(request.body.contractTypeFieldId);
    const occupancyTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success,
        occupancyTypes,
        allContractTypeFields
    });
}
