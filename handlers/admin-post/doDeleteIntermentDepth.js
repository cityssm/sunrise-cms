import { deleteRecord } from '../../database/deleteRecord.js';
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('IntermentDepths', request.body.intermentDepthId, request.session.user);
    const intermentDepths = getCachedIntermentDepths();
    response.json({
        success,
        intermentDepths
    });
}
