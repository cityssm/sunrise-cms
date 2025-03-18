import addCommittalType from "../../database/addCommittalType.js";
import getCommittalTypes from "../../database/getCommittalTypes.js";
let committalTypes = await getCommittalTypes();
export async function getCommittalTypeIdByKey(committalTypeKey, user) {
    const committalType = committalTypes.find((committalType) => committalType.committalTypeKey ===
        committalTypeKey);
    if (committalType === undefined) {
        const committalTypeId = await addCommittalType({
            committalTypeKey,
            committalType: committalTypeKey
        }, user);
        committalTypes = await getCommittalTypes();
        return committalTypeId;
    }
    return committalType.committalTypeId;
}
