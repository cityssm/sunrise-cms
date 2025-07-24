import addBurialSiteTypeField from '../../database/addBurialSiteTypeField.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
export default function handler(request, response) {
    const burialSiteTypeFieldId = addBurialSiteTypeField(request.body, request.session.user);
    const burialSiteTypes = getCachedBurialSiteTypes();
    response.json({
        success: true,
        burialSiteTypeFieldId,
        burialSiteTypes
    });
}
