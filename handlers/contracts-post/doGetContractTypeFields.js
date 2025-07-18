import { getAllContractTypeFields, getContractTypeById } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const allContractTypeFields = getAllContractTypeFields();
    const result = getContractTypeById(Number.parseInt(request.body.contractTypeId, 10));
    const contractTypeFields = [...allContractTypeFields];
    contractTypeFields.push(...(result.contractTypeFields ?? []));
    response.json({
        contractTypeFields
    });
}
