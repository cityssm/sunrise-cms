import getServiceTypesFromDatabase from '../../database/getServiceTypes.js';
let serviceTypes;
export function getCachedServiceTypeById(serviceTypeId) {
    const cachedServiceTypes = getCachedServiceTypes();
    return cachedServiceTypes.find((currentServiceType) => currentServiceType.serviceTypeId === serviceTypeId);
}
export function getCachedServiceTypes() {
    serviceTypes ??= getServiceTypesFromDatabase();
    return serviceTypes;
}
export function getCachedServiceTypeByServiceType(serviceType) {
    const cachedServiceTypes = getCachedServiceTypes();
    const serviceTypeLowerCase = serviceType.toLowerCase();
    return cachedServiceTypes.find((currentServiceType) => currentServiceType.serviceType.toLowerCase() === serviceTypeLowerCase);
}
export function clearServiceTypesCache() {
    serviceTypes = undefined;
}
