import getIntermentContainerTypesFromDatabase from '../../database/getIntermentContainerTypes.js';
const cache = {
    intermentContainerTypes: undefined
};
export function getCachedIntermentContainerTypeById(intermentContainerTypeId) {
    const cachedContainerTypes = getCachedIntermentContainerTypes();
    return cachedContainerTypes.find((currentContainerType) => currentContainerType.intermentContainerTypeId === intermentContainerTypeId);
}
export function getCachedIntermentContainerTypes() {
    cache.intermentContainerTypes ??= getIntermentContainerTypesFromDatabase();
    return cache.intermentContainerTypes;
}
export function clearIntermentContainerTypesCache() {
    cache.intermentContainerTypes = undefined;
}
