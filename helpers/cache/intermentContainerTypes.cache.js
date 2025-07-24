import getIntermentContainerTypesFromDatabase from '../../database/getIntermentContainerTypes.js';
let intermentContainerTypes;
export function getCachedIntermentContainerTypeById(intermentContainerTypeId) {
    const cachedContainerTypes = getCachedIntermentContainerTypes();
    return cachedContainerTypes.find((currentContainerType) => currentContainerType.intermentContainerTypeId === intermentContainerTypeId);
}
export function getCachedIntermentContainerTypes() {
    intermentContainerTypes ??= getIntermentContainerTypesFromDatabase();
    return intermentContainerTypes;
}
export function clearIntermentContainerTypesCache() {
    intermentContainerTypes = undefined;
}
