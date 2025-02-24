import deleteOccupancyTypePrint from '../../database/deleteOccupancyTypePrint.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = await deleteOccupancyTypePrint(request.body.contractTypeId, request.body.printEJS, request.session.user);
    const occupancyTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success,
        occupancyTypes,
        allContractTypeFields
    });
}
