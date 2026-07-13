import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('IntermentDepths', request.body.intermentDepthId)
        : moveRecordDown('IntermentDepths', request.body.intermentDepthId);
    const intermentDepths = getCachedIntermentDepths();
    response.json({
        success,
        intermentDepths
    });
}
