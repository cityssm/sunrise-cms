import { moveBurialSiteTypeFieldUp, moveBurialSiteTypeFieldUpToTop } from '../../database/moveBurialSiteTypeField.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveBurialSiteTypeFieldUpToTop(request.body.burialSiteTypeFieldId)
        : moveBurialSiteTypeFieldUp(request.body.burialSiteTypeFieldId);
    const burialSiteTypes = getCachedBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
