import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getCachedBurialSiteTypes } from '../../helpers/cache/burialSiteTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('BurialSiteTypes', request.body.burialSiteTypeId)
        : moveRecordDown('BurialSiteTypes', request.body.burialSiteTypeId);
    const burialSiteTypes = getCachedBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
