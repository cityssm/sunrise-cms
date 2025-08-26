"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getFuneralDirectorsByFuneralHomeId;
var better_sqlite3_1 = require("better-sqlite3");
var database_helpers_js_1 = require("../helpers/database.helpers.js");
function getFuneralDirectorsByFuneralHomeId(funeralHomeId, connectedDatabase) {
    var database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB, { readonly: true });
    var funeralDirectors = database
        .prepare("select funeralDirectorName, count(*) as usageCount\n       from Contracts\n       where recordDelete_timeMillis is null\n         and funeralHomeId = ?\n         and funeralDirectorName is not null\n         and trim(funeralDirectorName) != ''\n       group by funeralDirectorName\n       order by usageCount desc, funeralDirectorName\n       limit 20")
        .all(funeralHomeId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return funeralDirectors;
}
