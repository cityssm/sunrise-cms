import getCemeteriesFromDatabase from '../../database/getCemeteries.js';
const cache = {
    cemeteries: undefined
};
export function getCachedCemeteries() {
    cache.cemeteries ??= getCemeteriesFromDatabase();
    return cache.cemeteries;
}
export function getCachedCemeteryById(cemeteryId) {
    const cachedCemeteries = getCachedCemeteries();
    return cachedCemeteries.find((currentCemetery) => currentCemetery.cemeteryId === cemeteryId);
}
export function clearCemeteriesCache() {
    cache.cemeteries = undefined;
}
