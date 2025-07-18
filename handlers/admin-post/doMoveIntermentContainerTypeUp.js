import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getIntermentContainerTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordUpToTop('IntermentContainerTypes', request.body.intermentContainerTypeId)
        : moveRecordUp('IntermentContainerTypes', request.body.intermentContainerTypeId);
    const intermentContainerTypes = getIntermentContainerTypes();
    response.json({
        success,
        intermentContainerTypes
    });
}
