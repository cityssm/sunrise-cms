"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedBurialSiteTypeById = getCachedBurialSiteTypeById;
exports.getCachedBurialSiteTypes = getCachedBurialSiteTypes;
exports.getCachedBurialSiteTypesByBurialSiteType = getCachedBurialSiteTypesByBurialSiteType;
exports.clearBurialSiteTypesCache = clearBurialSiteTypesCache;
var getBurialSiteTypes_js_1 = require("../../database/getBurialSiteTypes.js");
var burialSiteTypes;
function getCachedBurialSiteTypeById(burialSiteTypeId) {
    var cachedTypes = getCachedBurialSiteTypes();
    return cachedTypes.find(function (currentType) { return currentType.burialSiteTypeId === burialSiteTypeId; });
}
function getCachedBurialSiteTypes(includeDeleted) {
    if (includeDeleted === void 0) { includeDeleted = false; }
    burialSiteTypes !== null && burialSiteTypes !== void 0 ? burialSiteTypes : (burialSiteTypes = (0, getBurialSiteTypes_js_1.default)(includeDeleted));
    return burialSiteTypes;
}
function getCachedBurialSiteTypesByBurialSiteType(burialSiteType, includeDeleted) {
    if (includeDeleted === void 0) { includeDeleted = false; }
    var cachedTypes = getCachedBurialSiteTypes(includeDeleted);
    var typeLowerCase = burialSiteType.toLowerCase();
    return cachedTypes.find(function (currentType) { return currentType.burialSiteType.toLowerCase() === typeLowerCase; });
}
function clearBurialSiteTypesCache() {
    burialSiteTypes = undefined;
}
