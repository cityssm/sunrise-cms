import addBurialSite from '../../database/addBurialSite.js';
import { clearNextPreviousBurialSiteIdCache } from '../../helpers/burialSites.helpers.js';
export default async function handler(request, response) {
    const burialSiteId = await addBurialSite(request.body, request.session.user);
    response.json({
        success: true,
        burialSiteId
    });
    response.on('finish', () => {
        clearNextPreviousBurialSiteIdCache(-1);
    });
}
