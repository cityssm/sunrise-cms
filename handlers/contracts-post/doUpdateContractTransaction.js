import getContractTransactions from '../../database/getContractTransactions.js';
import updateContractTransaction from '../../database/updateContractTransaction.js';
export default async function handler(request, response) {
    await updateContractTransaction(request.body, request.session.user);
    const contractTransactions = await getContractTransactions(request.body.contractId, {
        includeIntegrations: true
    });
    response.json({
        success: true,
        contractTransactions
    });
}
