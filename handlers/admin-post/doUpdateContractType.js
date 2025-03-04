import updateContractType from '../../database/updateContractType.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = await updateContractType(request.body, request.session.user);
    const contractTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success,
        contractTypes,
        allContractTypeFields
    });
}
