"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getBurialSiteTypeFields;
var better_sqlite3_1 = require("better-sqlite3");
var database_helpers_js_1 = require("../helpers/database.helpers.js");
var updateRecordOrderNumber_js_1 = require("./updateRecordOrderNumber.js");
function getBurialSiteTypeFields(burialSiteTypeId, connectedDatabase) {
    var database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB);
    var updateOrderNumbers = !database.readonly;
    var typeFields = database
        .prepare("select burialSiteTypeFieldId,\n        burialSiteTypeField, fieldType, fieldValues,\n        isRequired, pattern, minLength, maxLength, orderNumber\n        from BurialSiteTypeFields\n        where recordDelete_timeMillis is null\n        and burialSiteTypeId = ?\n        order by orderNumber, burialSiteTypeField")
        .all(burialSiteTypeId);
    if (updateOrderNumbers) {
        var expectedOrderNumber = 0;
        for (var _i = 0, typeFields_1 = typeFields; _i < typeFields_1.length; _i++) {
            var typeField = typeFields_1[_i];
            if (typeField.orderNumber !== expectedOrderNumber) {
                (0, updateRecordOrderNumber_js_1.updateRecordOrderNumber)('BurialSiteTypeFields', typeField.burialSiteTypeFieldId, expectedOrderNumber, database);
                typeField.orderNumber = expectedOrderNumber;
            }
            expectedOrderNumber += 1;
        }
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return typeFields;
}
