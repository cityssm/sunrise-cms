import addCommittalType from '../../database/addCommittalType.js';
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js';
export default function handler(request, response) {
    const committalTypeId = addCommittalType(request.body, request.session.user);
    const committalTypes = getCachedCommittalTypes();
    response.json({
        success: true,
        committalTypeId,
        committalTypes
    });
}
