import getWorkOrderMilestoneTypesFromDatabase from '../../database/getWorkOrderMilestoneTypes.js';
let workOrderMilestoneTypes;
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
    workOrderMilestoneTypes ??=
        getWorkOrderMilestoneTypesFromDatabase(includeDeleted);
    return workOrderMilestoneTypes;
}
export function clearWorkOrderMilestoneTypesCache() {
    workOrderMilestoneTypes = undefined;
}
