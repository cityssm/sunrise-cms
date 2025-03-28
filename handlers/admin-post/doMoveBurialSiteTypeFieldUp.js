import { moveBurialSiteTypeFieldUp, moveBurialSiteTypeFieldUpToTop } from '../../database/moveBurialSiteTypeField.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveBurialSiteTypeFieldUpToTop(request.body.burialSiteTypeFieldId)
        : await moveBurialSiteTypeFieldUp(request.body.burialSiteTypeFieldId);
    const burialSiteTypes = await getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
