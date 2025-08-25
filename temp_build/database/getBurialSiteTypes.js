"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getBurialSiteTypes;
var better_sqlite3_1 = require("better-sqlite3");
var database_helpers_js_1 = require("../helpers/database.helpers.js");
var getBurialSiteTypeFields_js_1 = require("./getBurialSiteTypeFields.js");
var updateRecordOrderNumber_js_1 = require("./updateRecordOrderNumber.js");
function getBurialSiteTypes(includeDeleted, connectedDatabase) {
    if (includeDeleted === void 0) { includeDeleted = false; }
    var database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB);
    var updateOrderNumbers = !includeDeleted;
    var burialSiteTypes = database
        .prepare("select burialSiteTypeId, burialSiteType,\n        bodyCapacityMax, crematedCapacityMax,\n        orderNumber\n        from BurialSiteTypes\n        ".concat(includeDeleted ? '' : ' where recordDelete_timeMillis is null ', "\n        order by orderNumber, burialSiteType"))
        .all();
    var expectedOrderNumber = -1;
    for (var _i = 0, burialSiteTypes_1 = burialSiteTypes; _i < burialSiteTypes_1.length; _i++) {
        var burialSiteType = burialSiteTypes_1[_i];
        expectedOrderNumber += 1;
        if (updateOrderNumbers &&
            burialSiteType.orderNumber !== expectedOrderNumber) {
            (0, updateRecordOrderNumber_js_1.updateRecordOrderNumber)('BurialSiteTypes', burialSiteType.burialSiteTypeId, expectedOrderNumber, database);
            burialSiteType.orderNumber = expectedOrderNumber;
        }
        burialSiteType.burialSiteTypeFields = (0, getBurialSiteTypeFields_js_1.default)(burialSiteType.burialSiteTypeId, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return burialSiteTypes;
}
