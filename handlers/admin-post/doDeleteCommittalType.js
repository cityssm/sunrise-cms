import { deleteRecord } from '../../database/deleteRecord.js';
import { getCommittalTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('CommittalTypes', request.body.committalTypeId, request.session.user);
    const committalTypes = getCommittalTypes();
    response.json({
        success,
        committalTypes
    });
}
