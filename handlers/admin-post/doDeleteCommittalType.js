import { deleteRecord } from '../../database/deleteRecord.js';
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js';
export default function handler(request, response) {
    const success = deleteRecord('CommittalTypes', request.body.committalTypeId, request.session.user);
    const committalTypes = getCachedCommittalTypes();
    response.json({
        success,
        committalTypes
    });
}
