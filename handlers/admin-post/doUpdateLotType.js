import { updateRecord } from '../../database/updateRecord.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = await updateRecord('LotTypes', request.body.burialSiteTypeId, request.body.lotType, request.session.user);
    const lotTypes = await getBurialSiteTypes();
    response.json({
        success,
        lotTypes
    });
}
