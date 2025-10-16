import getWorkOrderTypesFromDatabase from '../../database/getWorkOrderTypes.js';
let workOrderTypes;
export function getCachedWorkOrderTypeById(workOrderTypeId) {
    const cachedWorkOrderTypes = getCachedWorkOrderTypes();
    return cachedWorkOrderTypes.find((currentWorkOrderType) => currentWorkOrderType.workOrderTypeId === workOrderTypeId);
}
export function getCachedWorkOrderTypes() {
    workOrderTypes ??= getWorkOrderTypesFromDatabase();
    return workOrderTypes;
}
export function clearWorkOrderTypesCache() {
    workOrderTypes = undefined;
}
