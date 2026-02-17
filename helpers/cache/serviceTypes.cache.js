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
export function clearServiceTypesCache() {
    serviceTypes = undefined;
}
