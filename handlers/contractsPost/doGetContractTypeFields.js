import { getAllCachedContractTypeFields, getCachedContractTypeById } from '../../helpers/cache/contractTypes.cache.js';
export default function handler(request, response) {
    const allContractTypeFields = getAllCachedContractTypeFields();
    const result = getCachedContractTypeById(Math.trunc(Number(request.body.contractTypeId)));
    const contractTypeFields = [
        ...allContractTypeFields,
        ...(result.contractTypeFields ?? [])
    ];
    response.json({
        contractTypeFields
    });
}
