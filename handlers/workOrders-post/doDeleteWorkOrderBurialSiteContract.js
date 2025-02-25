import deleteWorkOrderBurialSiteContract from '../../database/deleteWorkOrderBurialSiteContract.js';
import getBurialSiteContracts from '../../database/getBurialSiteContracts.js';
export default async function handler(request, response) {
    const success = await deleteWorkOrderBurialSiteContract(request.body.workOrderId, request.body.burialSiteContractId, request.session.user);
    const workOrderBurialSiteContracts = await getBurialSiteContracts({
        workOrderId: request.body.workOrderId
    }, {
        limit: -1,
        offset: 0,
        includeInterments: true,
        includeFees: false,
        includeTransactions: false
    });
    response.json({
        success,
        workOrderBurialSiteContracts: workOrderBurialSiteContracts.burialSiteContracts
    });
}
