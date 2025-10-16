import addBurialSiteType from '../../database/addBurialSiteType.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
export default function handler(request, response) {
    const burialSiteTypeId = addBurialSiteType(request.body, request.session.user);
    const burialSiteTypes = getCachedBurialSiteTypes();
    response.json({
        success: true,
        burialSiteTypeId,
        burialSiteTypes
    });
}
