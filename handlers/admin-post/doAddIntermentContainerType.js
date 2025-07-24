import addIntermentContainerType from '../../database/addIntermentContainerType.js';
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js';
export default function handler(request, response) {
    const intermentContainerTypeId = addIntermentContainerType(request.body, request.session.user);
    const intermentContainerTypes = getCachedIntermentContainerTypes();
    response.json({
        success: true,
        intermentContainerTypeId,
        intermentContainerTypes
    });
}
