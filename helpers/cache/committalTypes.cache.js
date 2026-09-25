import getCommittalTypesFromDatabase from '../../database/getCommittalTypes.js';
const cache = {
    committalTypes: undefined
};
export function getCachedCommittalTypeById(committalTypeId) {
    const cachedCommittalTypes = getCachedCommittalTypes();
    return cachedCommittalTypes.find((currentCommittalType) => currentCommittalType.committalTypeId === committalTypeId);
}
export function getCachedCommittalTypes() {
    cache.committalTypes ??= getCommittalTypesFromDatabase();
    return cache.committalTypes;
}
export function clearCommittalTypesCache() {
    cache.committalTypes = undefined;
}
