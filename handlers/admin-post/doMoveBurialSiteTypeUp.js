import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getBurialSiteTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordUpToTop('BurialSiteTypes', request.body.burialSiteTypeId)
        : moveRecordUp('BurialSiteTypes', request.body.burialSiteTypeId);
    const burialSiteTypes = getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
