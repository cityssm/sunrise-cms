import addRelatedContract from '../../database/addRelatedContract.js';
import getContracts from '../../database/getContracts.js';
export default async function handler(request, response) {
    addRelatedContract(request.body);
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
