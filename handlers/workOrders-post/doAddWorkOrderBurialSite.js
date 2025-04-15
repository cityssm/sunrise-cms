import addWorkOrderBurialSite from '../../database/addWorkOrderBurialSite.js';
import getBurialSites from '../../database/getBurialSites.js';
export default async function handler(request, response) {
    const success = await addWorkOrderBurialSite({
        burialSiteId: request.body.burialSiteId,
        workOrderId: request.body.workOrderId
    }, request.session.user);
    const results = await getBurialSites({
        workOrderId: request.body.workOrderId
    }, {
        limit: -1,
        offset: 0,
        includeContractCount: false
    });
    response.json({
        success,
        workOrderBurialSites: results.burialSites
    });
}
