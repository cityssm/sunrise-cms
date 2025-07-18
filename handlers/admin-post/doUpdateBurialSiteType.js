import updateBurialSiteType from '../../database/updateBurialSiteType.js';
import { getBurialSiteTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = updateBurialSiteType(request.body, request.session.user);
    const burialSiteTypes = getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
