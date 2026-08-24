import getWorkOrderTypesFromDatabase from '../../database/getWorkOrderTypes.js';
let workOrderTypes;
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
    workOrderTypes ??= getWorkOrderTypesFromDatabase();
    return workOrderTypes;
}
export function clearWorkOrderTypesCache() {
    workOrderTypes = undefined;
}
