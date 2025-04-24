import addWorkOrderContract from '../../database/addWorkOrderContract.js';
import getContracts from '../../database/getContracts.js';
export default async function handler(request, response) {
    const success = addWorkOrderContract({
        contractId: request.body.contractId,
        workOrderId: request.body.workOrderId
    }, request.session.user);
    const results = await getContracts({
        workOrderId: request.body.workOrderId
    }, {
        limit: -1,
        offset: 0,
        includeFees: false,
        includeInterments: true,
        includeTransactions: false
    });
    response.json({
        success,
        workOrderContracts: results.contracts
    });
}
