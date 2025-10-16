import { updateCommittalType } from '../../database/updateRecord.js';
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js';
export default function handler(request, response) {
    const success = updateCommittalType(request.body.committalTypeId, request.body.committalType, request.session.user);
    const committalTypes = getCachedCommittalTypes();
    response.json({
        success,
        committalTypes
    });
}
