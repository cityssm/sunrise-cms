"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getCemeteries;
var better_sqlite3_1 = require("better-sqlite3");
var database_helpers_js_1 = require("../helpers/database.helpers.js");
function getCemeteries(filters, connectedDatabase) {
    var database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB, { readonly: true });
    var sqlParameters = [];
    if ((filters === null || filters === void 0 ? void 0 : filters.parentCemeteryId) !== undefined) {
        sqlParameters.push(filters.parentCemeteryId);
    }
    var cemeteries = database
        .prepare("select cem.cemeteryId, cem.cemeteryName, cem.cemeteryKey, cem.cemeteryDescription,\n          cem.cemeteryLatitude, cem.cemeteryLongitude, cem.cemeterySvg,\n          cem.cemeteryAddress1, cem.cemeteryAddress2,\n          cem.cemeteryCity, cem.cemeteryProvince, cem.cemeteryPostalCode,\n          cem.cemeteryPhoneNumber,\n          p.cemeteryId as parentCemeteryId, p.cemeteryName as parentCemeteryName,\n          count(b.burialSiteId) as burialSiteCount\n\n        from Cemeteries cem\n        left join Cemeteries p on cem.parentCemeteryId = p.cemeteryId and p.recordDelete_timeMillis is null\n        left join BurialSites b on cem.cemeteryId = b.cemeteryId and b.recordDelete_timeMillis is null\n        \n        where cem.recordDelete_timeMillis is null\n        ".concat((filters === null || filters === void 0 ? void 0 : filters.parentCemeteryId) === undefined ? '' : 'and cem.parentCemeteryId = ?', "\n\n        group by cem.cemeteryId, cem.cemeteryName, cem.cemeteryDescription,\n          cem.cemeteryLatitude, cem.cemeteryLongitude, cem.cemeterySvg,\n          cem.cemeteryAddress1, cem.cemeteryAddress2, cem.cemeteryCity, cem.cemeteryProvince, cem.cemeteryPostalCode,\n          cem.cemeteryPhoneNumber,\n          p.cemeteryId, p.cemeteryName\n\n        order by cem.cemeteryName, cem.cemeteryId"))
        .all(sqlParameters);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return cemeteries;
}
