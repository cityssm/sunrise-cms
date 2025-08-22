import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('CommittalTypes', request.body.committalTypeId)
        : moveRecordDown('CommittalTypes', request.body.committalTypeId);
    const committalTypes = getCachedCommittalTypes();
    response.json({
        success,
        committalTypes
    });
}
