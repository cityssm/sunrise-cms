import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveRecordUpToTop('BurialSiteTypes', request.body.burialSiteTypeId)
        : await moveRecordUp('BurialSiteTypes', request.body.burialSiteTypeId);
    const burialSiteTypes = await getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
