import getBurialSiteStatusesFromDatabase from '../../database/getBurialSiteStatuses.js';
let burialSiteStatuses;
export function getCachedBurialSiteStatusByBurialSiteStatus(burialSiteStatus, includeDeleted = false) {
    const cachedStatuses = getCachedBurialSiteStatuses(includeDeleted);
    const statusLowerCase = burialSiteStatus.toLowerCase();
    return cachedStatuses.find((currentStatus) => currentStatus.burialSiteStatus.toLowerCase() === statusLowerCase);
}
export function getCachedBurialSiteStatusById(burialSiteStatusId) {
    const cachedStatuses = getCachedBurialSiteStatuses();
    return cachedStatuses.find((currentStatus) => currentStatus.burialSiteStatusId === burialSiteStatusId);
}
export function getCachedBurialSiteStatuses(includeDeleted = false) {
    burialSiteStatuses ??= getBurialSiteStatusesFromDatabase(includeDeleted);
    return burialSiteStatuses;
}
export function clearBurialSiteStatusesCache() {
    burialSiteStatuses = undefined;
}
