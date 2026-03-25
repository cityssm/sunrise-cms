import getCemeteriesFromDatabase from '../../database/getCemeteries.js';
let cemeteries;
export function getCachedCemeteries() {
    cemeteries ??= getCemeteriesFromDatabase();
    return cemeteries;
}
export function getCachedCemeteryById(cemeteryId) {
    const cachedCemeteries = getCachedCemeteries();
    return cachedCemeteries.find((currentCemetery) => currentCemetery.cemeteryId === cemeteryId);
}
export function clearCemeteriesCache() {
    cemeteries = undefined;
}
