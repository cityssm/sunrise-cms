import addWorkOrderContract from '../../database/addWorkOrderContract.js';
import getContracts from '../../database/getContracts.js';
export default async function handler(request, response) {
    const success = await addWorkOrderContract({
        workOrderId: request.body.workOrderId,
        contractId: request.body.contractId
    }, request.session.user);
    const results = await getContracts({
        workOrderId: request.body.workOrderId
    }, {
        limit: -1,
        offset: 0,
        includeInterments: true,
        includeFees: false,
        includeTransactions: false
    });
    response.json({
        success,
        workOrderContracts: results.contracts
    });
}
