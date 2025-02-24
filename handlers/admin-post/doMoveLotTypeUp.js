import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveRecordUpToTop('LotTypes', request.body.burialSiteTypeId)
        : await moveRecordUp('LotTypes', request.body.burialSiteTypeId);
    const lotTypes = await getBurialSiteTypes();
    response.json({
        success,
        lotTypes
    });
}
