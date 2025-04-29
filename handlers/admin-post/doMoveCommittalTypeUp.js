import { moveRecordUp, moveRecordUpToTop } from '../../database/moveRecord.js';
import { getCommittalTypes } from '../../helpers/functions.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordUpToTop('CommittalTypes', request.body.committalTypeId)
        : moveRecordUp('CommittalTypes', request.body.committalTypeId);
    const committalTypes = getCommittalTypes();
    response.json({
        success,
        committalTypes
    });
}
