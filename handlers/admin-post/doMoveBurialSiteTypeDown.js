import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getBurialSiteTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('BurialSiteTypes', request.body.burialSiteTypeId)
        : moveRecordDown('BurialSiteTypes', request.body.burialSiteTypeId);
    const burialSiteTypes = getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
