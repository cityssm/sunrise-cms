"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addContractAttachment;
const better_sqlite3_1 = require("better-sqlite3");
const database_helpers_js_1 = require("../helpers/database.helpers.js");
function addContractAttachment(attachment, user, connectedDatabase) {
    var _a, _b;
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB);
    const rightNowMillis = Date.now();
    const result = database
        .prepare(`insert into ContractAttachments (
        contractId, attachmentTitle, attachmentDetails,
        fileName, filePath,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(attachment.contractId, (_a = attachment.attachmentTitle) !== null && _a !== void 0 ? _a : attachment.fileName, (_b = attachment.attachmentDetails) !== null && _b !== void 0 ? _b : '', attachment.fileName, attachment.filePath, user.userName, rightNowMillis, user.userName, rightNowMillis);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result.lastInsertRowid;
}
