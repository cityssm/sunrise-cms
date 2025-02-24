import addOccupancyTypeField from '../../database/addOccupancyTypeField.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const contractTypeFieldId = await addOccupancyTypeField(request.body, request.session.user);
    const occupancyTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success: true,
        contractTypeFieldId,
        occupancyTypes,
        allContractTypeFields
    });
}
