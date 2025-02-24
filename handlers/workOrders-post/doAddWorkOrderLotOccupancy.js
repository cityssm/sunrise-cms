import addWorkOrderLotOccupancy from '../../database/addWorkOrderLotOccupancy.js';
import getBurialSiteContracts from '../../database/getLotOccupancies.js';
export default async function handler(request, response) {
    const success = await addWorkOrderLotOccupancy({
        workOrderId: request.body.workOrderId,
        burialSiteContractId: request.body.burialSiteContractId
    }, request.session.user);
    const workOrderLotOccupanciesResults = await getBurialSiteContracts({
        workOrderId: request.body.workOrderId
    }, {
        limit: -1,
        offset: 0,
        includeOccupants: true,
        includeFees: false,
        includeTransactions: false
    });
    response.json({
        success,
        workOrderLotOccupancies: workOrderLotOccupanciesResults.lotOccupancies
    });
}
