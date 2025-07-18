import addBurialSiteType from '../../database/addBurialSiteType.js';
import { getBurialSiteTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const burialSiteTypeId = addBurialSiteType(request.body, request.session.user);
    const burialSiteTypes = getBurialSiteTypes();
    response.json({
        success: true,
        burialSiteTypeId,
        burialSiteTypes
    });
}
