"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedBurialSiteStatusByBurialSiteStatus = getCachedBurialSiteStatusByBurialSiteStatus;
exports.getCachedBurialSiteStatusById = getCachedBurialSiteStatusById;
exports.getCachedBurialSiteStatuses = getCachedBurialSiteStatuses;
exports.clearBurialSiteStatusesCache = clearBurialSiteStatusesCache;
var getBurialSiteStatuses_js_1 = require("../../database/getBurialSiteStatuses.js");
var burialSiteStatuses;
function getCachedBurialSiteStatusByBurialSiteStatus(burialSiteStatus, includeDeleted) {
    if (includeDeleted === void 0) { includeDeleted = false; }
    var cachedStatuses = getCachedBurialSiteStatuses(includeDeleted);
    var statusLowerCase = burialSiteStatus.toLowerCase();
    return cachedStatuses.find(function (currentStatus) {
        return currentStatus.burialSiteStatus.toLowerCase() === statusLowerCase;
    });
}
function getCachedBurialSiteStatusById(burialSiteStatusId) {
    var cachedStatuses = getCachedBurialSiteStatuses();
    return cachedStatuses.find(function (currentStatus) { return currentStatus.burialSiteStatusId === burialSiteStatusId; });
}
function getCachedBurialSiteStatuses(includeDeleted) {
    if (includeDeleted === void 0) { includeDeleted = false; }
    burialSiteStatuses !== null && burialSiteStatuses !== void 0 ? burialSiteStatuses : (burialSiteStatuses = (0, getBurialSiteStatuses_js_1.default)(includeDeleted));
    return burialSiteStatuses;
}
function clearBurialSiteStatusesCache() {
    burialSiteStatuses = undefined;
}
