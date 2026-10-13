import getBurialSiteTypesFromDatabase from '../../database/getBurialSiteTypes.js';
const cache = {
    burialSiteTypes: undefined
};
export function getCachedBurialSiteTypeById(burialSiteTypeId) {
    const cachedTypes = getCachedBurialSiteTypes();
    return cachedTypes.find((currentType) => currentType.burialSiteTypeId === burialSiteTypeId);
}
export function getCachedBurialSiteTypes(shouldIncludeDeletedRecords = false) {
    if (shouldIncludeDeletedRecords) {
        return getBurialSiteTypesFromDatabase(shouldIncludeDeletedRecords);
    }
    cache.burialSiteTypes ??= getBurialSiteTypesFromDatabase();
    return cache.burialSiteTypes;
}
export function getCachedBurialSiteTypesByBurialSiteType(burialSiteType, shouldIncludeDeletedRecords = false) {
    const cachedTypes = getCachedBurialSiteTypes(shouldIncludeDeletedRecords);
    const typeLowerCase = burialSiteType.toLowerCase();
    return cachedTypes.find((currentType) => currentType.burialSiteType.toLowerCase() === typeLowerCase);
}
export function clearBurialSiteTypesCache() {
    cache.burialSiteTypes = undefined;
}
