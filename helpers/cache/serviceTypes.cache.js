import getServiceTypesFromDatabase from '../../database/getServiceTypes.js';
const cache = {
    serviceTypes: undefined
};
export function getCachedServiceTypeById(serviceTypeId) {
    const cachedServiceTypes = getCachedServiceTypes();
    return cachedServiceTypes.find((currentServiceType) => currentServiceType.serviceTypeId === serviceTypeId);
}
export function getCachedServiceTypes() {
    cache.serviceTypes ??= getServiceTypesFromDatabase();
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
