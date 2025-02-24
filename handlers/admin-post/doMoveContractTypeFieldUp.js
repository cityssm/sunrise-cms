import { moveContractTypeFieldUp, moveContractTypeFieldUpToTop } from '../../database/moveContractTypeField.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveContractTypeFieldUpToTop(request.body.contractTypeFieldId)
        : await moveContractTypeFieldUp(request.body.contractTypeFieldId);
    const contractTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success,
        contractTypes,
        allContractTypeFields
    });
}
