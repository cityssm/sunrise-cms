"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getWorkOrderComments;
const utils_datetime_1 = require("@cityssm/utils-datetime");
const better_sqlite3_1 = require("better-sqlite3");
const database_helpers_js_1 = require("../helpers/database.helpers.js");
function getWorkOrderComments(workOrderId, connectedDatabase) {
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB, { readonly: true });
    database.function('userFn_dateIntegerToString', utils_datetime_1.dateIntegerToString);
    database.function('userFn_timeIntegerToString', utils_datetime_1.timeIntegerToString);
    database.function('userFn_timeIntegerToPeriodString', utils_datetime_1.timeIntegerToPeriodString);
    const workOrderComments = database
        .prepare(`select workOrderCommentId,
        commentDate, userFn_dateIntegerToString(commentDate) as commentDateString,
        commentTime,
        userFn_timeIntegerToString(commentTime) as commentTimeString,
        userFn_timeIntegerToPeriodString(commentTime) as commentTimePeriodString,
        comment,
        recordCreate_userName, recordUpdate_userName
        from WorkOrderComments
        where recordDelete_timeMillis is null
        and workOrderId = ?
        order by commentDate desc, commentTime desc, workOrderCommentId desc`)
        .all(workOrderId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return workOrderComments;
}
