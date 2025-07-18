import { moveBurialSiteTypeFieldDown, moveBurialSiteTypeFieldDownToBottom } from '../../database/moveBurialSiteTypeField.js';
import { getBurialSiteTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveBurialSiteTypeFieldDownToBottom(request.body.burialSiteTypeFieldId)
        : moveBurialSiteTypeFieldDown(request.body.burialSiteTypeFieldId);
    const burialSiteTypes = getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
