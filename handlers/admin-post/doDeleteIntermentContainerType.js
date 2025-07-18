import { deleteRecord } from '../../database/deleteRecord.js';
import { getIntermentContainerTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = deleteRecord('IntermentContainerTypes', request.body.intermentContainerTypeId, request.session.user);
    const intermentContainerTypes = getIntermentContainerTypes();
    response.json({
        success,
        intermentContainerTypes
    });
}
