import getWorkOrderTypesFromDatabase from '../../database/getWorkOrderTypes.js';
const cache = {
    workOrderTypes: undefined
};
export function getCachedWorkOrderTypeById(workOrderTypeId) {
    const cachedWorkOrderTypes = getCachedWorkOrderTypes();
    return cachedWorkOrderTypes.find((currentWorkOrderType) => currentWorkOrderType.workOrderTypeId === workOrderTypeId);
}
export function getCachedWorkOrderTypeByWorkOrderType(workOrderTypeString) {
    const cachedWorkOrderTypes = getCachedWorkOrderTypes();
    const workOrderTypeLowerCase = workOrderTypeString.toLowerCase();
    return cachedWorkOrderTypes.find((currentWorkOrderType) => currentWorkOrderType.workOrderType.toLowerCase() ===
        workOrderTypeLowerCase);
}
export function getCachedWorkOrderTypes() {
    cache.workOrderTypes ??= getWorkOrderTypesFromDatabase();
    return cache.workOrderTypes;
}
export function clearWorkOrderTypesCache() {
    cache.workOrderTypes = undefined;
}
