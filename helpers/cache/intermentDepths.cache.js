import getIntermentDepthsFromDatabase from '../../database/getIntermentDepths.js';
const cache = {
    intermentDepths: undefined
};
export function getCachedIntermentDepthById(intermentDepthId) {
    const cachedIntermentDepths = getCachedIntermentDepths();
    return cachedIntermentDepths.find((currentIntermentDepth) => currentIntermentDepth.intermentDepthId === intermentDepthId);
}
export function getCachedIntermentDepths(shouldIncludeDeletedRecords = false, connectedDatabase) {
    if (shouldIncludeDeletedRecords) {
        return getIntermentDepthsFromDatabase(shouldIncludeDeletedRecords, connectedDatabase);
    }
    cache.intermentDepths ??= getIntermentDepthsFromDatabase(shouldIncludeDeletedRecords, connectedDatabase);
    return cache.intermentDepths;
}
export function clearIntermentDepthsCache() {
    cache.intermentDepths = undefined;
}
