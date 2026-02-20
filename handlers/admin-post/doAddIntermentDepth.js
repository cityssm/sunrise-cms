import addIntermentDepth from '../../database/addIntermentDepth.js';
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js';
export default function handler(request, response) {
    const intermentDepthId = addIntermentDepth(request.body, request.session.user);
    const intermentDepths = getCachedIntermentDepths();
    response.json({
        success: true,
        intermentDepthId,
        intermentDepths
    });
}
