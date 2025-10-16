import updateBurialSiteTypeField from '../../database/updateBurialSiteTypeField.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
export default function handler(request, response) {
    const success = updateBurialSiteTypeField(request.body, request.session.user);
    const burialSiteTypes = getCachedBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
