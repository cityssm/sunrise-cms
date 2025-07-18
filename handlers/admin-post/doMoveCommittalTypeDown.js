import { moveRecordDown, moveRecordDownToBottom } from '../../database/moveRecord.js';
import { getCommittalTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const success = request.body.moveToEnd === '1'
        ? moveRecordDownToBottom('CommittalTypes', request.body.committalTypeId)
        : moveRecordDown('CommittalTypes', request.body.committalTypeId);
    const committalTypes = getCommittalTypes();
    response.json({
        success,
        committalTypes
    });
}
