import { deleteRecord } from '../../database/deleteRecord.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = await deleteRecord('BurialSiteTypes', request.body.burialSiteTypeId, request.session.user);
    const burialSiteTypes = await getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
