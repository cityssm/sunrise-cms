import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveRecordDownToBottom('ContractTypes', request.body.contractTypeId)
        : await moveRecordDown('ContractTypes', request.body.contractTypeId);
    const contractTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success,
        contractTypes,
        allContractTypeFields
    });
}
