import addBurialSiteTypeField from '../../database/addBurialSiteTypeField.js';
import { getBurialSiteTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const burialSiteTypeFieldId = addBurialSiteTypeField(request.body, request.session.user);
    const burialSiteTypes = getBurialSiteTypes();
    response.json({
        success: true,
        burialSiteTypeFieldId,
        burialSiteTypes
    });
}
