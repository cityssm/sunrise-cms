import { getContractTypeById, getAllContractTypeFields } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const allContractTypeFields = await getAllContractTypeFields();
    const result = (await getContractTypeById(Number.parseInt(request.body.contractTypeId, 10)));
    const ContractTypeFields = [...allContractTypeFields];
    ContractTypeFields.push(...(result.ContractTypeFields ?? []));
    response.json({
        ContractTypeFields
    });
}
