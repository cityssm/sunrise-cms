"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
var utils_datetime_1 = require("@cityssm/utils-datetime");
var better_sqlite3_1 = require("better-sqlite3");
var getBurialSites_js_1 = require("../../database/getBurialSites.js");
var getCemeteries_js_1 = require("../../database/getCemeteries.js");
var burialSiteStatuses_cache_js_1 = require("../../helpers/cache/burialSiteStatuses.cache.js");
var burialSiteTypes_cache_js_1 = require("../../helpers/cache/burialSiteTypes.cache.js");
var database_helpers_js_1 = require("../../helpers/database.helpers.js");
function handler(request, response) {
    var cemeteries = (0, getCemeteries_js_1.default)();
    var burialSiteTypes = (0, burialSiteTypes_cache_js_1.getCachedBurialSiteTypes)();
    var burialSiteStatuses = (0, burialSiteStatuses_cache_js_1.getCachedBurialSiteStatuses)();
    // Get all burial sites for GPS capture
    var result = (0, getBurialSites_js_1.default)({}, {
        limit: 1000, // Get a large number of burial sites
        offset: 0,
        includeContractCount: false
    });
    // Get interment names for burial sites with active contracts
    var burialSiteInterments = getBurialSiteInterments();
    // Add interment names to burial sites
    var burialSitesWithInterments = result.burialSites.map(function (site) {
        var _a;
        return (__assign(__assign({}, site), { intermentNames: ((_a = burialSiteInterments.find(function (bi) { return bi.burialSiteId === site.burialSiteId; })) === null || _a === void 0 ? void 0 : _a.deceasedNames) || [] }));
    });
    response.render('burialSite-gpsCapture', {
        headTitle: 'GPS Coordinate Capture',
        burialSites: burialSitesWithInterments,
        burialSiteStatuses: burialSiteStatuses,
        burialSiteTypes: burialSiteTypes,
        cemeteries: cemeteries,
        cemeteryId: request.query.cemeteryId,
        burialSiteTypeId: request.query.burialSiteTypeId
    });
}
function getBurialSiteInterments() {
    var database = (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB, { readonly: true });
    var currentDate = (0, utils_datetime_1.dateToInteger)(new Date());
    try {
        // Get deceased names for burial sites with active contracts
        var rows = database
            .prepare("SELECT c.burialSiteId, ci.deceasedName\n         FROM Contracts c\n         INNER JOIN ContractInterments ci ON c.contractId = ci.contractId\n         WHERE c.recordDelete_timeMillis IS NULL\n         AND ci.recordDelete_timeMillis IS NULL\n         AND c.burialSiteId IS NOT NULL\n         AND c.contractStartDate <= ?\n         AND (c.contractEndDate IS NULL OR c.contractEndDate >= ?)\n         ORDER BY c.burialSiteId, ci.deceasedName")
            .all(currentDate, currentDate);
        // Group deceased names by burial site
        var intermentMap = new Map();
        for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
            var row = rows_1[_i];
            if (!intermentMap.has(row.burialSiteId)) {
                intermentMap.set(row.burialSiteId, []);
            }
            intermentMap.get(row.burialSiteId).push(row.deceasedName);
        }
        return Array.from(intermentMap.entries()).map(function (_a) {
            var burialSiteId = _a[0], deceasedNames = _a[1];
            return ({
                burialSiteId: burialSiteId,
                deceasedNames: deceasedNames
            });
        });
    }
    finally {
        database.close();
    }
}
