import addRecord from '../../database/addRecord.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const burialSiteTypeId = addRecord('BurialSiteTypes', request.body.burialSiteType, request.body.orderNumber ?? -1, request.session.user);
    const burialSiteTypes = getBurialSiteTypes();
    response.json({
        success: true,
        burialSiteTypeId,
        burialSiteTypes
    });
}
