import addLotOccupancyTransaction from '../../database/addLotOccupancyTransaction.js';
import getLotOccupancyTransactions from '../../database/getLotOccupancyTransactions.js';
export default async function handler(request, response) {
    await addLotOccupancyTransaction(request.body, request.session.user);
    const lotOccupancyTransactions = await getLotOccupancyTransactions(request.body.burialSiteContractId, { includeIntegrations: true });
    response.json({
        success: true,
        lotOccupancyTransactions
    });
}
