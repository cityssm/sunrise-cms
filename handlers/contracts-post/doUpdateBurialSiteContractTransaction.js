import getBurialSiteContractTransactions from '../../database/getBurialSiteContractTransactions.js';
import updateBurialSiteContractTransaction from '../../database/updateBurialSiteContractTransaction.js';
export default async function handler(request, response) {
    await updateBurialSiteContractTransaction(request.body, request.session.user);
    const burialSiteContractTransactions = await getBurialSiteContractTransactions(request.body.burialSiteContractId, {
        includeIntegrations: true
    });
    response.json({
        success: true,
        burialSiteContractTransactions
    });
}
