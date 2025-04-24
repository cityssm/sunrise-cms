import getBurialSites from '../../database/getBurialSites.js';
import { updateBurialSiteStatus } from '../../database/updateBurialSite.js';
export default function handler(request, response) {
    const success = updateBurialSiteStatus(request.body.burialSiteId, request.body.burialSiteStatusId, request.session.user);
    const results = getBurialSites({
        workOrderId: request.body.workOrderId
    }, {
        limit: -1,
        offset: 0,
        includeContractCount: true
    });
    response.json({
        success,
        workOrderBurialSites: results.burialSites
    });
}
