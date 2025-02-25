import deleteBurialSiteContractTransaction from '../../database/deleteBurialSiteContractTransaction.js';
import getBurialSiteContractTransactions from '../../database/getBurialSiteContractTransactions.js';
export default async function handler(request, response) {
    const success = await deleteBurialSiteContractTransaction(request.body.burialSiteContractId, request.body.transactionIndex, request.session.user);
    const burialSiteContractTransactions = await getBurialSiteContractTransactions(request.body.burialSiteContractId, {
        includeIntegrations: true
    });
    response.json({
        success,
        burialSiteContractTransactions
    });
}
