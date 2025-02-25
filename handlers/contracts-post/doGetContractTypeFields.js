import { getAllContractTypeFields, getContractTypeById } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const allContractTypeFields = await getAllContractTypeFields();
    const result = (await getContractTypeById(Number.parseInt(request.body.contractTypeId, 10)));
    const contractTypeFields = [...allContractTypeFields];
    contractTypeFields.push(...(result.contractTypeFields ?? []));
    response.json({
        contractTypeFields
    });
}
