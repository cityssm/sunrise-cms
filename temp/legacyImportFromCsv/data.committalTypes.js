import addCommittalType from '../../database/addCommittalType.js';
import getCommittalTypes from '../../database/getCommittalTypes.js';
let committalTypes = getCommittalTypes(true);
export function getCommittalTypeIdByKey(committalTypeKey, user, database) {
    const committalType = committalTypes.find((possibleCommittalType) => possibleCommittalType.committalTypeKey === committalTypeKey);
    if (committalType === undefined) {
        const committalTypeId = addCommittalType({
            committalType: committalTypeKey,
            committalTypeKey
        }, user, database);
        committalTypes = getCommittalTypes(true, database);
        return committalTypeId;
    }
    return committalType.committalTypeId;
}
