import updateIntermentContainerType from '../../database/updateIntermentContainerType.js';
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js';
export default function handler(request, response) {
    const success = updateIntermentContainerType(request.body, request.session.user);
    const intermentContainerTypes = getCachedIntermentContainerTypes();
    response.json({
        success,
        intermentContainerTypes
    });
}
