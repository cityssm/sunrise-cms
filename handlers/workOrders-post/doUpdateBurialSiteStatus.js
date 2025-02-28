import getBurialSites from '../../database/getBurialSites.js';
import { updateBurialSiteStatus } from '../../database/updateBurialSite.js';
export default async function handler(request, response) {
    const success = await updateBurialSiteStatus(request.body.lotId, request.body.burialSiteStatusId, request.session.user);
    const results = await getBurialSites({
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
