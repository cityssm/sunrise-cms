import getWorkOrderStatusesFromDatabase from '../../database/getWorkOrderStatuses.js';
const cache = {
    workOrderStatuses: undefined
};
export function getCachedWorkOrderStatusById(workOrderStatusId) {
    const cachedWorkOrderStatuses = getCachedWorkOrderStatuses();
    return cachedWorkOrderStatuses.find((currentWorkOrderStatus) => currentWorkOrderStatus.workOrderStatusId === workOrderStatusId);
}
export function getCachedWorkOrderStatuses() {
    cache.workOrderStatuses ??= getWorkOrderStatusesFromDatabase();
    return cache.workOrderStatuses;
}
export function clearWorkOrderStatusesCache() {
    cache.workOrderStatuses = undefined;
}
export function getCachedWorkOrderStatusByWorkOrderStatus(workOrderStatusString) {
    const cachedWorkOrderStatuses = getCachedWorkOrderStatuses();
    const workOrderStatusLowerCase = workOrderStatusString.toLowerCase();
    return cachedWorkOrderStatuses.find((currentWorkOrderStatus) => currentWorkOrderStatus.workOrderStatus.toLowerCase() ===
        workOrderStatusLowerCase);
}
