import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveRecordUpToTop('OccupancyTypes', request.body.contractTypeId)
        : await moveRecordUp('OccupancyTypes', request.body.contractTypeId);
    const occupancyTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success,
        occupancyTypes,
        allContractTypeFields
    });
}
