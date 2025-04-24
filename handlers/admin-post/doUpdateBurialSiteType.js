import { updateRecord } from '../../database/updateRecord.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = updateRecord('BurialSiteTypes', request.body.burialSiteTypeId, request.body.burialSiteType, request.session.user);
    const burialSiteTypes = getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
