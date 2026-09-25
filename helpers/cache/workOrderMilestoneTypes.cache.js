import getWorkOrderMilestoneTypesFromDatabase from '../../database/getWorkOrderMilestoneTypes.js';
const cache = {
    workOrderMilestoneTypes: undefined
};
export function getCachedWorkOrderMilestoneTypeById(workOrderMilestoneTypeId) {
    const cachedWorkOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes();
    return cachedWorkOrderMilestoneTypes.find((currentWorkOrderMilestoneType) => currentWorkOrderMilestoneType.workOrderMilestoneTypeId ===
        workOrderMilestoneTypeId);
}
export function getCachedWorkOrderMilestoneTypeByWorkOrderMilestoneType(workOrderMilestoneTypeString, includeDeleted = false) {
    const cachedWorkOrderMilestoneTypes = getCachedWorkOrderMilestoneTypes(includeDeleted);
    const workOrderMilestoneTypeLowerCase = workOrderMilestoneTypeString.toLowerCase();
    return cachedWorkOrderMilestoneTypes.find((currentWorkOrderMilestoneType) => currentWorkOrderMilestoneType.workOrderMilestoneType.toLowerCase() ===
        workOrderMilestoneTypeLowerCase);
}
export function getCachedWorkOrderMilestoneTypes(includeDeleted = false) {
    if (includeDeleted) {
        return getWorkOrderMilestoneTypesFromDatabase(includeDeleted);
    }
    cache.workOrderMilestoneTypes ??=
        getWorkOrderMilestoneTypesFromDatabase(includeDeleted);
    return cache.workOrderMilestoneTypes;
}
export function clearWorkOrderMilestoneTypesCache() {
    cache.workOrderMilestoneTypes = undefined;
}
