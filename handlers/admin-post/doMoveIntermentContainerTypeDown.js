import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('IntermentContainerTypes', request.body.intermentContainerTypeId)
        : moveRecordDown('IntermentContainerTypes', request.body.intermentContainerTypeId);
    const intermentContainerTypes = getCachedIntermentContainerTypes();
    response.json({
        success,
        intermentContainerTypes
    });
}
