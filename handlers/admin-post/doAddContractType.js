import addContractType from '../../database/addContractType.js';
import { getAllCachedContractTypeFields, getCachedContractTypes } from '../../helpers/cache/contractTypes.cache.js';
export default function handler(request, response) {
    const contractTypeId = addContractType(request.body, request.session.user);
    const contractTypes = getCachedContractTypes();
    const allContractTypeFields = getAllCachedContractTypeFields();
    response.json({
        success: true,
        allContractTypeFields,
        contractTypeId,
        contractTypes
    });
}
