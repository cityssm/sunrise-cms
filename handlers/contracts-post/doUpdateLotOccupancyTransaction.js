import getLotOccupancyTransactions from '../../database/getLotOccupancyTransactions.js';
import updateLotOccupancyTransaction from '../../database/updateLotOccupancyTransaction.js';
export default async function handler(request, response) {
    await updateLotOccupancyTransaction(request.body, request.session.user);
    const lotOccupancyTransactions = await getLotOccupancyTransactions(request.body.lotOccupancyId, { includeIntegrations: true });
    response.json({
        success: true,
        lotOccupancyTransactions
    });
}
