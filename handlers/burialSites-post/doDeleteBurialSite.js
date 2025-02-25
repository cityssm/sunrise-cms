import { deleteRecord } from '../../database/deleteRecord.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default async function handler(request, response) {
    const burialSiteId = Number.parseInt(request.body.burialSiteId, 10);
    const success = await deleteRecord('BurialSites', burialSiteId, request.session.user);
    response.json({
        success
    });
    response.on('finish', () => {
        clearNextPreviousBurialSiteIdCache(burialSiteId);
    });
}
