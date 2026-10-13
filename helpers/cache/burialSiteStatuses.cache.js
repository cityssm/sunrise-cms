import getBurialSiteStatusesFromDatabase from '../../database/getBurialSiteStatuses.js';
const cache = {
    burialSiteStatuses: undefined
};
export function getCachedBurialSiteStatusByBurialSiteStatus(burialSiteStatus, shouldIncludeDeletedRecords = false) {
    const cachedStatuses = getCachedBurialSiteStatuses(shouldIncludeDeletedRecords);
    const statusLowerCase = burialSiteStatus.toLowerCase();
    return cachedStatuses.find((currentStatus) => currentStatus.burialSiteStatus.toLowerCase() === statusLowerCase);
}
export function getCachedBurialSiteStatusById(burialSiteStatusId) {
    const cachedStatuses = getCachedBurialSiteStatuses();
    return cachedStatuses.find((currentStatus) => currentStatus.burialSiteStatusId === burialSiteStatusId);
}
export function getCachedBurialSiteStatuses(shouldIncludeDeletedRecords = false) {
    if (shouldIncludeDeletedRecords) {
        return getBurialSiteStatusesFromDatabase(shouldIncludeDeletedRecords);
    }
    cache.burialSiteStatuses ??= getBurialSiteStatusesFromDatabase(shouldIncludeDeletedRecords);
    return cache.burialSiteStatuses;
}
export function clearBurialSiteStatusesCache() {
    cache.burialSiteStatuses = undefined;
}
