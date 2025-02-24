import { deleteRecord } from '../../database/deleteRecord.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = await deleteRecord('LotTypes', request.body.burialSiteTypeId, request.session.user);
    const lotTypes = await getBurialSiteTypes();
    response.json({
        success,
        lotTypes
    });
}
