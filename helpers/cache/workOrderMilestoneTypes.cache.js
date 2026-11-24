import getWorkOrderMilestoneTypesFromDatabase from '../../database/getWorkOrderMilestoneTypes.js';
const cache = {
    workOrderMilestoneTypes: undefined
};
export function getCachedWorkOrderMilestoneTypeById(workOrderMilestoneTypeId) {
    const cachedWorkOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes();
    return cachedWorkOrderMilestoneTypes.find((currentWorkOrderMilestoneType) => currentWorkOrderMilestoneType.workOrderMilestoneTypeId ===
        workOrderMilestoneTypeId);
}
export function getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType(workOrderMilestoneTypeString, shouldIncludeDeletedRecords = false) {
    const cachedWorkOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes(shouldIncludeDeletedRecords);
    const workOrderMilestoneTypeLowerCase = workOrderMilestoneTypeString.toLowerCase();
    return cachedWorkOrderMilestoneTypes.find((currentWorkOrderMilestoneType) => currentWorkOrderMilestoneType.workOrderMilestoneType.toLowerCase() ===
        workOrderMilestoneTypeLowerCase);
}
export function getCachedWorkOrderMilestoneTypes(shouldIncludeDeletedRecords = false, connectedDatabase) {
    if (shouldIncludeDeletedRecords) {
        return getWorkOrderMilestoneTypesFromDatabase(shouldIncludeDeletedRecords, connectedDatabase);
    }
    cache.workOrderMilestoneTypes ??= getWorkOrderMilestoneTypesFromDatabase(shouldIncludeDeletedRecords, connectedDatabase);
    return cache.workOrderMilestoneTypes;
}
export function clearWorkOrderMilestoneTypesCache() {
    cache.workOrderMilestoneTypes = undefined;
}
