import { moveOccupancyTypePrintDown, moveOccupancyTypePrintDownToBottom } from '../../database/moveOccupancyTypePrintDown.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveOccupancyTypePrintDownToBottom(request.body.contractTypeId, request.body.printEJS)
        : await moveOccupancyTypePrintDown(request.body.contractTypeId, request.body.printEJS);
    const occupancyTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success,
        occupancyTypes,
        allContractTypeFields
    });
}
