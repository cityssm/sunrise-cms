import addContractTypeField from '../../database/addContractTypeField.js';
import { getAllCachedContractTypeFields, getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
export default function handler(request, response) {
    const contractTypeFieldId = addContractTypeField(request.body, request.session.user);
    const contractTypes = getCachedContractTypes();
    const allContractTypeFields = getAllCachedContractTypeFields();
    response.json({
        success: true,
        allContractTypeFields,
        contractTypeFieldId,
        contractTypes
    });
}
