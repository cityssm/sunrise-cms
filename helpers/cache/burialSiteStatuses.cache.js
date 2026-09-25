import getBurialSiteStatusesFromDatabase from '../../database/getBurialSiteStatuses.js';
const cache = {
    burialSiteStatuses: undefined
};
export function getCachedBurialSiteStatusByBurialSiteStatus(burialSiteStatus, shouldIncludeDeleted = false) {
    const cachedStatuses = getCachedBurialSiteStatuses(shouldIncludeDeleted);
    const statusLowerCase = burialSiteStatus.toLowerCase();
    return cachedStatuses.find((currentStatus) => currentStatus.burialSiteStatus.toLowerCase() === statusLowerCase);
}
export function getCachedBurialSiteStatusById(burialSiteStatusId) {
    const cachedStatuses = getCachedBurialSiteStatuses();
    return cachedStatuses.find((currentStatus) => currentStatus.burialSiteStatusId === burialSiteStatusId);
}
export function getCachedBurialSiteStatuses(shouldIncludeDeleted = false) {
    if (shouldIncludeDeleted) {
        return getBurialSiteStatusesFromDatabase(shouldIncludeDeleted);
    }
    cache.burialSiteStatuses ??=
        getBurialSiteStatusesFromDatabase(shouldIncludeDeleted);
    return cache.burialSiteStatuses;
}
export function clearBurialSiteStatusesCache() {
    cache.burialSiteStatuses = undefined;
}
