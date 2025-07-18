import addIntermentContainerType from '../../database/addIntermentContainerType.js';
import { getIntermentContainerTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const intermentContainerTypeId = addIntermentContainerType(request.body, request.session.user);
    const intermentContainerTypes = getIntermentContainerTypes();
    response.json({
        success: true,
        intermentContainerTypeId,
        intermentContainerTypes
    });
}
