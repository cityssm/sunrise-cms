import updateIntermentDepth from '../../database/updateIntermentDepth.js';
import { getCachedIntermentDepths } from '../../helpers/cache/intermentDepths.cache.js';
export default function handler(request, response) {
    const success = updateIntermentDepth(request.body, request.session.user);
    const intermentDepths = getCachedIntermentDepths();
    response.json({
        success,
        intermentDepths
    });
}
