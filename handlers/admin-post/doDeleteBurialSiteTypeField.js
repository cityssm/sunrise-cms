import { deleteRecord } from '../../database/deleteRecord.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('BurialSiteTypeFields', request.body.burialSiteTypeFieldId, request.session.user);
    const burialSiteTypes = getCachedBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
