import deleteLotOccupancyTransaction from '../../database/deleteLotOccupancyTransaction.js';
import getLotOccupancyTransactions from '../../database/getLotOccupancyTransactions.js';
export default async function handler(request, response) {
    const success = await deleteLotOccupancyTransaction(request.body.lotOccupancyId, request.body.transactionIndex, request.session.user);
    const lotOccupancyTransactions = await getLotOccupancyTransactions(request.body.lotOccupancyId, { includeIntegrations: true });
    response.json({
        success,
        lotOccupancyTransactions
    });
}
