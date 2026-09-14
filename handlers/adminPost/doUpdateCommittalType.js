import updateCommittalType from '../../database/updateCommittalType.js';
import { getCachedCommittalTypes } from '../../helpers/cache/committalTypes.cache.js';
export default function handler(request, response) {
    const success = updateCommittalType(request.body, request.session.user);
    const committalTypes = getCachedCommittalTypes();
    response.json({
        success,
        committalTypes
    });
}
