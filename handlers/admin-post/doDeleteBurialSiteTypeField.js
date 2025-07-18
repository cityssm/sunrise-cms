import { deleteRecord } from '../../database/deleteRecord.js';
import { getBurialSiteTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = deleteRecord('BurialSiteTypeFields', request.body.burialSiteTypeFieldId, request.session.user);
    const burialSiteTypes = getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
