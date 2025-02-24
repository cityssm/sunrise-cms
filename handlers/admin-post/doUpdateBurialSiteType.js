import { updateRecord } from '../../database/updateRecord.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = await updateRecord('BurialSiteTypes', request.body.burialSiteTypeId, request.body.burialSiteType, request.session.user);
    const burialSiteTypes = await getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
