import addContractType from '../../database/addContractType.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const contractTypeId = await addContractType(request.body, request.session.user);
    const contractTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success: true,
        contractTypeId,
        contractTypes,
        allContractTypeFields
    });
}
