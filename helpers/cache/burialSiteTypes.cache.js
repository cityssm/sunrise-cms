import getBurialSiteTypesFromDatabase from '../../database/getBurialSiteTypes.js';
const cache = {
    burialSiteTypes: undefined
};
export function getCachedBurialSiteTypeById(burialSiteTypeId) {
    const cachedTypes = getCachedBurialSiteTypes();
    return cachedTypes.find((currentType) => currentType.burialSiteTypeId === burialSiteTypeId);
}
export function getCachedBurialSiteTypes(shouldIncludeDeleted = false) {
    if (shouldIncludeDeleted) {
        return getBurialSiteTypesFromDatabase(shouldIncludeDeleted);
    }
    cache.burialSiteTypes ??= getBurialSiteTypesFromDatabase();
    return cache.burialSiteTypes;
}
export function getCachedBurialSiteTypesByBurialSiteType(burialSiteType, shouldIncludeDeleted = false) {
    const cachedTypes = getCachedBurialSiteTypes(shouldIncludeDeleted);
    const typeLowerCase = burialSiteType.toLowerCase();
    return cachedTypes.find((currentType) => currentType.burialSiteType.toLowerCase() === typeLowerCase);
}
export function clearBurialSiteTypesCache() {
    cache.burialSiteTypes = undefined;
}
