import getServiceTypesFromDatabase from '../../database/getServiceTypes.js';
const cache = {
    serviceTypes: undefined
};
export function getCachedServiceTypeById(serviceTypeId) {
    const cachedServiceTypes = getCachedServiceTypes();
    return cachedServiceTypes.find((currentServiceType) => currentServiceType.serviceTypeId === serviceTypeId);
}
export function getCachedServiceTypes(shouldIncludeDeletedRecords = false, connectedDatabase) {
    if (shouldIncludeDeletedRecords) {
        return getServiceTypesFromDatabase(shouldIncludeDeletedRecords, connectedDatabase);
    }
    cache.serviceTypes ??= getServiceTypesFromDatabase(shouldIncludeDeletedRecords, connectedDatabase);
    return cache.serviceTypes;
}
export function getCachedServiceTypeByServiceType(serviceType) {
    const cachedServiceTypes = getCachedServiceTypes();
    const serviceTypeLowerCase = serviceType.toLowerCase();
    return cachedServiceTypes.find((currentServiceType) => currentServiceType.serviceType.toLowerCase() === serviceTypeLowerCase);
}
export function clearServiceTypesCache() {
    cache.serviceTypes = undefined;
}
