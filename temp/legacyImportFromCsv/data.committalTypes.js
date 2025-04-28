import addCommittalType from '../../database/addCommittalType.js';
import getCommittalTypes from '../../database/getCommittalTypes.js';
let committalTypes = getCommittalTypes(true);
export function getCommittalTypeIdByKey(committalTypeKey, user) {
    const committalType = committalTypes.find((committalType) => committalType.committalTypeKey === committalTypeKey);
    if (committalType === undefined) {
        const committalTypeId = addCommittalType({
            committalTypeKey,
            committalType: committalTypeKey
        }, user);
        committalTypes = getCommittalTypes();
        return committalTypeId;
    }
    return committalType.committalTypeId;
}
