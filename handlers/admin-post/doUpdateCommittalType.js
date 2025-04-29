import { updateRecord } from '../../database/updateRecord.js';
import { getCommittalTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = updateRecord('CommittalTypes', request.body.committalTypeId, request.body.committalType, request.session.user);
    const committalTypes = getCommittalTypes();
    response.json({
        success,
        committalTypes
    });
}
