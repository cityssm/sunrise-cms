import { deleteRecord } from '../../database/deleteRecord.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default async function handler(request, response) {
    const success = await deleteRecord('Cemeteries', request.body.cemeteryId, request.session.user);
    response.json({
        success
    });
    response.on('finish', () => {
        clearNextPreviousBurialSiteIdCache(-1);
    });
}
