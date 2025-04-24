import deleteWorkOrderContract from '../../database/deleteWorkOrderContract.js';
import getContracts from '../../database/getContracts.js';
export default async function handler(request, response) {
    const success = deleteWorkOrderContract(request.body.workOrderId, request.body.contractId, request.session.user);
    const workOrderContracts = await getContracts({
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
        workOrderContracts: workOrderContracts.contracts
    });
}
