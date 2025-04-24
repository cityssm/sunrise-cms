import deleteContractTransaction from '../../database/deleteContractTransaction.js';
import getContractTransactions from '../../database/getContractTransactions.js';
export default async function handler(request, response) {
    const success = deleteContractTransaction(request.body.contractId, request.body.transactionIndex, request.session.user);
    const contractTransactions = await getContractTransactions(request.body.contractId, {
        includeIntegrations: true
    });
    response.json({
        success,
        contractTransactions
    });
}
