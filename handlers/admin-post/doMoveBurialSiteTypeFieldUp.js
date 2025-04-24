import { moveBurialSiteTypeFieldUp, moveBurialSiteTypeFieldUpToTop } from '../../database/moveBurialSiteTypeField.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveBurialSiteTypeFieldUpToTop(request.body.burialSiteTypeFieldId)
        : moveBurialSiteTypeFieldUp(request.body.burialSiteTypeFieldId);
    const burialSiteTypes = getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
