import { updateRecord } from '../../database/updateRecord.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = await updateRecord('OccupancyTypes', request.body.contractTypeId, request.body.occupancyType, request.session.user);
    const occupancyTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success,
        occupancyTypes,
        allContractTypeFields
    });
}
