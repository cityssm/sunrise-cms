import { deleteRecord } from '../../database/deleteRecord.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = await deleteRecord('BurialSiteTypeFields', request.body.lotTypeFieldId, request.session.user);
    const lotTypes = await getBurialSiteTypes();
    response.json({
        success,
        lotTypes
    });
}
