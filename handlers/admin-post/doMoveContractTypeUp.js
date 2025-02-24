import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveRecordUpToTop('ContractTypes', request.body.contractTypeId)
        : await moveRecordUp('ContractTypes', request.body.contractTypeId);
    const contractTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success,
        contractTypes,
        allContractTypeFields
    });
}
