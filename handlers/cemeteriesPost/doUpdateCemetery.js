import rebuildBurialSiteNames from '../../database/rebuildBurialSiteNames.js';
import updateCemetery from '../../database/updateCemetery.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default function handler(request, response) {
    const success = updateCemetery(request.body, request.session.user);
    response.json({
        success,
        cemeteryId: request.body.cemeteryId
    });
    if (success) {
        response.on('finish', () => {
            rebuildBurialSiteNames(request.body.cemeteryId, request.session.user);
            clearNextPreviousBurialSiteIdCache();
        });
    }
}
