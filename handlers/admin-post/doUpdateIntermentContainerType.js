import updateIntermentContainerType from '../../database/updateIntermentContainerType.js';
import { getIntermentContainerTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = updateIntermentContainerType(request.body, request.session.user);
    const intermentContainerTypes = getIntermentContainerTypes();
    response.json({
        success,
        intermentContainerTypes
    });
}
