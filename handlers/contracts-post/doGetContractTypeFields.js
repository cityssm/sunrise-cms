import { getAllCachedContractTypeFields, getCachedContractTypeById } from '../../helpers/cache/contractTypes.cache.js';
export default function handler(request, response) {
    const allContractTypeFields = getAllCachedContractTypeFields();
    const result = getCachedContractTypeById(Number.parseInt(request.body.contractTypeId, 10));
    const contractTypeFields = [
        ...allContractTypeFields,
        ...(result.contractTypeFields ?? [])
    ];
    response.json({
        contractTypeFields
    });
}
