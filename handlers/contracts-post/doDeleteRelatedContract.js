import deleteRelatedContract from '../../database/deleteRelatedContract.js';
import getContracts from '../../database/getContracts.js';
export default async function handler(request, response) {
    deleteRelatedContract(request.body);
    const relatedContracts = await getContracts({
        relatedContractId: request.body.contractId
    }, {
        limit: -1,
        offset: 0,
        includeFees: false,
        includeInterments: true,
        includeTransactions: false
    });
    response.json({
        success: true,
        relatedContracts: relatedContracts.contracts
    });
}
