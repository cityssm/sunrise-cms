import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getBurialSiteTypes } from '../../helpers/functions.cache.js';
export default async function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? await moveRecordDownToBottom('BurialSiteTypes', request.body.burialSiteTypeId)
        : await moveRecordDown('BurialSiteTypes', request.body.burialSiteTypeId);
    const burialSiteTypes = await getBurialSiteTypes();
    response.json({
        success,
        burialSiteTypes
    });
}
