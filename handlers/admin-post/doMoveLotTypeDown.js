import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveRecordDownToBottom('LotTypes', request.body.burialSiteTypeId)
        : await moveRecordDown('LotTypes', request.body.burialSiteTypeId);
    const lotTypes = await getBurialSiteTypes();
    response.json({
        success,
        lotTypes
    });
}
