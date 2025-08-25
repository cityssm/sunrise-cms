"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getBurialSiteStatuses;
var better_sqlite3_1 = require("better-sqlite3");
var database_helpers_js_1 = require("../helpers/database.helpers.js");
var updateRecordOrderNumber_js_1 = require("./updateRecordOrderNumber.js");
function getBurialSiteStatuses(includeDeleted, connectedDatabase) {
    if (includeDeleted === void 0) { includeDeleted = false; }
    var database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB);
    var updateOrderNumbers = !includeDeleted;
    var statuses = database
        .prepare("select burialSiteStatusId, burialSiteStatus, orderNumber\n        from BurialSiteStatuses\n        ".concat(includeDeleted ? '' : ' where recordDelete_timeMillis is null ', "\n        order by orderNumber, burialSiteStatus"))
        .all();
    if (updateOrderNumbers) {
        var expectedOrderNumber = 0;
        for (var _i = 0, statuses_1 = statuses; _i < statuses_1.length; _i++) {
            var status_1 = statuses_1[_i];
            if (status_1.orderNumber !== expectedOrderNumber) {
                (0, updateRecordOrderNumber_js_1.updateRecordOrderNumber)('BurialSiteStatuses', status_1.burialSiteStatusId, expectedOrderNumber, database);
                status_1.orderNumber = expectedOrderNumber;
            }
            expectedOrderNumber += 1;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return statuses;
}
