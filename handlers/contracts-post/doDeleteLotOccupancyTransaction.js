import deleteLotOccupancyTransaction from '../../database/deleteLotOccupancyTransaction.js';
import getLotOccupancyTransactions from '../../database/getLotOccupancyTransactions.js';
export default async function handler(request, response) {
    const success = await deleteLotOccupancyTransaction(request.body.burialSiteContractId, request.body.transactionIndex, request.session.user);
    const lotOccupancyTransactions = await getLotOccupancyTransactions(request.body.burialSiteContractId, { includeIntegrations: true });
    response.json({
        success,
        lotOccupancyTransactions
    });
}
