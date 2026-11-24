import getCemeteriesFromDatabase from '../../database/getCemeteries.js';
const cache = {
    cemeteries: undefined
};
export function getCachedCemeteries(connectedDatabase) {
    cache.cemeteries ??= getCemeteriesFromDatabase(undefined, connectedDatabase);
    return cache.cemeteries;
}
export function getCachedCemeteryById(cemeteryId) {
    const cachedCemeteries = getCachedCemeteries();
    return cachedCemeteries.find((currentCemetery) => currentCemetery.cemeteryId === cemeteryId);
}
export function clearCemeteriesCache() {
    cache.cemeteries = undefined;
}
