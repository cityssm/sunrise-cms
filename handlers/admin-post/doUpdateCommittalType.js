import { updateRecord } from '../../database/updateRecord.js';
import { getCommittalTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = updateRecord('CommittalTypes', request.body.committalTypeId, request.body.committalType, request.session.user);
    const committalTypes = getCommittalTypes();
    response.json({
        success,
        committalTypes
    });
}
