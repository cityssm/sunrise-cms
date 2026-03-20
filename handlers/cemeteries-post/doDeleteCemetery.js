import deleteCemetery from '../../database/deleteCemetery.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default function handler(request, response) {
    const success = deleteCemetery(request.body.cemeteryId, request.session.user);
    if (!success) {
        response.status(400).json({
            errorMessage: 'Note that cemeteries with active contracts cannot be deleted.',
            success: false
        });
        return;
    }
    response.on('finish', () => {
        clearNextPreviousBurialSiteIdCache();
    });
    response.json({
        success
    });
}
