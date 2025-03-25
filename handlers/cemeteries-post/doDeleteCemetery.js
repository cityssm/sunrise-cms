import deleteCemetery from '../../database/deleteCemetery.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default async function handler(request, response) {
    const success = await deleteCemetery(request.body.cemeteryId, request.session.user);
    response.json({
        errorMessage: success
            ? ''
            : 'Note that cemeteries with active contracts cannot be deleted.',
        success
    });
    if (success) {
        response.on('finish', () => {
            clearNextPreviousBurialSiteIdCache(-1);
        });
    }
}
