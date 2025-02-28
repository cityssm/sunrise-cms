import { moveBurialSiteTypeFieldDown, moveBurialSiteTypeFieldDownToBottom } from '../../database/moveBurialSiteTypeField.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveBurialSiteTypeFieldDownToBottom(request.body.burialSiteTypeFieldId)
        : await moveBurialSiteTypeFieldDown(request.body.burialSiteTypeFieldId);
    const burialSiteTypes = await getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
