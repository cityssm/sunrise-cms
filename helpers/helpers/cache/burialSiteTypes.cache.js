import getBurialSiteTypesFromDatabase from '../../database/getBurialSiteTypes.js';
let burialSiteTypes;
export function getCachedBurialSiteTypeById(burialSiteTypeId) {
    const cachedTypes = getCachedBurialSiteTypes();
    return cachedTypes.find((currentType) => currentType.burialSiteTypeId === burialSiteTypeId);
}
export function getCachedBurialSiteTypes(includeDeleted = false) {
    burialSiteTypes ??= getBurialSiteTypesFromDatabase(includeDeleted);
    return burialSiteTypes;
}
export function getCachedBurialSiteTypesByBurialSiteType(burialSiteType, includeDeleted = false) {
    const cachedTypes = getCachedBurialSiteTypes(includeDeleted);
    const typeLowerCase = burialSiteType.toLowerCase();
    return cachedTypes.find((currentType) => currentType.burialSiteType.toLowerCase() === typeLowerCase);
}
export function clearBurialSiteTypesCache() {
    burialSiteTypes = undefined;
}
