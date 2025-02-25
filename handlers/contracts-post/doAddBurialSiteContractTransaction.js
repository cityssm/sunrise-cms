import addBurialSiteContractTransaction from '../../database/addBurialSiteContractTransaction.js';
import getBurialSiteContractTransactions from '../../database/getBurialSiteContractTransactions.js';
export default async function handler(request, response) {
    await addBurialSiteContractTransaction(request.body, request.session.user);
    const burialSiteContractTransactions = await getBurialSiteContractTransactions(request.body.burialSiteContractId, {
        includeIntegrations: true
    });
    response.json({
        success: true,
        burialSiteContractTransactions
    });
}
