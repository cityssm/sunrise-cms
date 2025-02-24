import { addRecord } from '../../database/addRecord.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const contractTypeId = await addRecord('OccupancyTypes', request.body.occupancyType, request.body.orderNumber ?? -1, request.session.user);
    const occupancyTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success: true,
        contractTypeId,
        occupancyTypes,
        allContractTypeFields
    });
}
