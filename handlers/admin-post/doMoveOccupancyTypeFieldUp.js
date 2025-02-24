import { moveOccupancyTypeFieldUp, moveOccupancyTypeFieldUpToTop } from '../../database/moveOccupancyTypeField.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveOccupancyTypeFieldUpToTop(request.body.contractTypeFieldId)
        : await moveOccupancyTypeFieldUp(request.body.contractTypeFieldId);
    const occupancyTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success,
        occupancyTypes,
        allContractTypeFields
    });
}
