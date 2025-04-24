import deleteWorkOrderBurialSite from '../../database/deleteWorkOrderBurialSite.js';
import getBurialSites from '../../database/getBurialSites.js';
export default function handler(request, response) {
    const success = deleteWorkOrderBurialSite(request.body.workOrderId, request.body.burialSiteId, request.session.user);
    const results = getBurialSites({
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
