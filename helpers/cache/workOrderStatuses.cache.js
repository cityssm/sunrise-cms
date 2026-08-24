import getWorkOrderStatusesFromDatabase from '../../database/getWorkOrderStatuses.js';
let workOrderStatuses;
export function getCachedWorkOrderStatusById(workOrderStatusId) {
    const cachedWorkOrderStatuses = getCachedWorkOrderStatuses();
    return cachedWorkOrderStatuses.find((currentWorkOrderStatus) => currentWorkOrderStatus.workOrderStatusId === workOrderStatusId);
}
export function getCachedWorkOrderStatuses() {
    workOrderStatuses ??= getWorkOrderStatusesFromDatabase();
    return workOrderStatuses;
}
export function clearWorkOrderStatusesCache() {
    workOrderStatuses = undefined;
}
export function getCachedWorkOrderStatusByWorkOrderStatus(workOrderStatusString) {
    const cachedWorkOrderStatuses = getCachedWorkOrderStatuses();
    const workOrderStatusLowerCase = workOrderStatusString.toLowerCase();
    return cachedWorkOrderStatuses.find((currentWorkOrderStatus) => currentWorkOrderStatus.workOrderStatus.toLowerCase() ===
        workOrderStatusLowerCase);
}
