import getIntermentDepthsFromDatabase from '../../database/getIntermentDepths.js';
let intermentDepths;
export function getCachedIntermentDepthById(intermentDepthId) {
    const cachedIntermentDepths = getCachedIntermentDepths();
    return cachedIntermentDepths.find((currentIntermentDepth) => currentIntermentDepth.intermentDepthId === intermentDepthId);
}
export function getCachedIntermentDepths() {
    intermentDepths ??= getIntermentDepthsFromDatabase();
    return intermentDepths;
}
export function clearIntermentDepthsCache() {
    intermentDepths = undefined;
}
