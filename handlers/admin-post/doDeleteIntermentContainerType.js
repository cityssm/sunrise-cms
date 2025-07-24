import { deleteRecord } from '../../database/deleteRecord.js';
import { getCachedIntermentContainerTypes } from '../../helpers/cache/intermentContainerTypes.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('IntermentContainerTypes', request.body.intermentContainerTypeId, request.session.user);
    const intermentContainerTypes = getCachedIntermentContainerTypes();
    response.json({
        success,
        intermentContainerTypes
    });
}
