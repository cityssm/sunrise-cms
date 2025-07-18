import { deleteRecord } from '../../database/deleteRecord.js';
import { getCommittalTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = deleteRecord('CommittalTypes', request.body.committalTypeId, request.session.user);
    const committalTypes = getCommittalTypes();
    response.json({
        success,
        committalTypes
    });
}
