import getBurialSiteContractTransactions from '../../database/getBurialSiteContractTransactions.js';
import updateLotOccupancyTransaction from '../../database/updateLotOccupancyTransaction.js';
export default async function handler(request, response) {
    await updateLotOccupancyTransaction(request.body, request.session.user);
    const burialSiteContractTransactions = await getBurialSiteContractTransactions(request.body.burialSiteContractId, { includeIntegrations: true });
    response.json({
        success: true,
        burialSiteContractTransactions
    });
}
