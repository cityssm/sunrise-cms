import getIntermentDepthsFromDatabase from '../../database/getIntermentDepths.js';
const cache = {
    intermentDepths: undefined
};
export function getCachedIntermentDepthById(intermentDepthId) {
    const cachedIntermentDepths = getCachedIntermentDepths();
    return cachedIntermentDepths.find((currentIntermentDepth) => currentIntermentDepth.intermentDepthId === intermentDepthId);
}
export function getCachedIntermentDepths() {
    cache.intermentDepths ??= getIntermentDepthsFromDatabase();
    return cache.intermentDepths;
}
export function clearIntermentDepthsCache() {
    cache.intermentDepths = undefined;
}
