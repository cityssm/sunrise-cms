import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordUpToTop('IntermentContainerTypes', request.body.intermentContainerTypeId)
        : moveRecordUp('IntermentContainerTypes', request.body.intermentContainerTypeId);
    const intermentContainerTypes = getCachedIntermentContainerTypes();
    response.json({
        success,
        intermentContainerTypes
    });
}
