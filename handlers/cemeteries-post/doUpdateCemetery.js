import rebuildBurialSiteNames from '../../database/rebuildBurialSiteNames.js';
import updateCemetery from '../../database/updateCemetery.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default async function handler(request, response) {
    const result = await updateCemetery(request.body, request.session.user);
    response.json({
        success: result.success,
        cemeteryId: request.body.cemeteryId,
        doRebuildBurialSiteNames: result.doRebuildBurialSiteNames
    });
    if (result.doRebuildBurialSiteNames) {
        response.on('finish', () => {
            void rebuildBurialSiteNames(request.body.cemeteryId, request.session.user);
            clearNextPreviousBurialSiteIdCache();
        });
    }
}
