import { moveContractTypePrintUp, moveContractTypePrintUpToTop } from '../../database/moveContractTypePrintUp.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveContractTypePrintUpToTop(request.body.contractTypeId, request.body.printEJS)
        : await moveContractTypePrintUp(request.body.contractTypeId, request.body.printEJS);
    const contractTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success,
        contractTypes,
        allContractTypeFields
    });
}
