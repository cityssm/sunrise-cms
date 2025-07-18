import addCommittalType from '../../database/addCommittalType.js';
import { getCommittalTypes } from '../../helpers/cache.helpers.js';
export default function handler(request, response) {
    const committalTypeId = addCommittalType(request.body, request.session.user);
    const committalTypes = getCommittalTypes();
    response.json({
        success: true,
        committalTypeId,
        committalTypes
    });
}
