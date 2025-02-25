import deleteWorkOrderBurialSite from '../../database/deleteWorkOrderBurialSite.js';
import getBurialSites from '../../database/getBurialSites.js';
export default async function handler(request, response) {
    const success = await deleteWorkOrderBurialSite(request.body.workOrderId, request.body.burialSiteId, request.session.user);
    const results = await getBurialSites({
        workOrderId: request.body.workOrderId
    }, {
        limit: -1,
        offset: 0,
        includeBurialSiteContractCount: false
    });
    response.json({
        success,
        workOrderBurialSites: results.burialSites
    });
}
