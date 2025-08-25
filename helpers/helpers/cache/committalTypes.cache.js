import getCommittalTypesFromDatabase from '../../database/getCommittalTypes.js';
let committalTypes;
export function getCachedCommittalTypeById(committalTypeId) {
    const cachedCommittalTypes = getCachedCommittalTypes();
    return cachedCommittalTypes.find((currentCommittalType) => currentCommittalType.committalTypeId === committalTypeId);
}
export function getCachedCommittalTypes() {
    committalTypes ??= getCommittalTypesFromDatabase();
    return committalTypes;
}
export function clearCommittalTypesCache() {
    committalTypes = undefined;
}
