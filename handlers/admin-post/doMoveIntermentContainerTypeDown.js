import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getIntermentContainerTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('IntermentContainerTypes', request.body.intermentContainerTypeId)
        : moveRecordDown('IntermentContainerTypes', request.body.intermentContainerTypeId);
    const intermentContainerTypes = getIntermentContainerTypes();
    response.json({
        success,
        intermentContainerTypes
    });
}
