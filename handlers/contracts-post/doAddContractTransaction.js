import addContractTransaction from '../../database/addContractTransaction.js';
import getContractTransactions from '../../database/getContractTransactions.js';
export default async function handler(request, response) {
    await addContractTransaction(request.body, request.session.user);
    const contractTransactions = await getContractTransactions(request.body.contractId, {
        includeIntegrations: true
    });
    response.json({
        success: true,
        contractTransactions
    });
}
