import addContractTypeField from '../../database/addContractTypeField.js';
import { getAllContractTypeFields, getContractTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const contractTypeFieldId = await addContractTypeField(request.body, request.session.user);
    const contractTypes = await getContractTypes();
    const allContractTypeFields = await getAllContractTypeFields();
    response.json({
        success: true,
        contractTypeFieldId,
        contractTypes,
        allContractTypeFields
    });
}
