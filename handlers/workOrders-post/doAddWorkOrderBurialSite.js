import addWorkOrderBurialSite from '../../database/addWorkOrderBurialSite.js';
import getBurialSites from '../../database/getBurialSites.js';
export default async function handler(request, response) {
    const success = await addWorkOrderBurialSite({
        workOrderId: request.body.workOrderId,
        burialSiteId: request.body.burialSiteId
    }, request.session.user);
    const workOrderLotsResults = await getBurialSites({
        workOrderId: request.body.workOrderId
    }, {
        limit: -1,
        offset: 0,
        includeContractCount: false
    });
    response.json({
        success,
        workOrderBurialSites: workOrderLotsResults.burialSites
    });
}
