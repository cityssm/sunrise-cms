import addWorkOrderBurialSite from '../../database/addWorkOrderBurialSite.js';
import getBurialSites from '../../database/getBurialSites.js';
export default function handler(request, response) {
    const success = addWorkOrderBurialSite({
        burialSiteId: request.body.burialSiteId,
        workOrderId: request.body.workOrderId
    }, request.session.user);
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
