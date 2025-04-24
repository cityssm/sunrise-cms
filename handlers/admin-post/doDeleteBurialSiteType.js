import { deleteRecord } from '../../database/deleteRecord.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('BurialSiteTypes', request.body.burialSiteTypeId, request.session.user);
    const burialSiteTypes = getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
