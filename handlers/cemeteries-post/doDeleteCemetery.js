import deleteCemetery from '../../database/deleteCemetery.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default function handler(request, response) {
    const success = deleteCemetery(request.body.cemeteryId, request.session.user);
    response.json({
        errorMessage: success
            ? ''
            : 'Note that cemeteries with active contracts cannot be deleted.',
        success
    });
    if (success) {
        response.on('finish', () => {
            clearNextPreviousBurialSiteIdCache();
        });
    }
}
