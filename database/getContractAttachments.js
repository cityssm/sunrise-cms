"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getContractAttachments;
const better_sqlite3_1 = require("better-sqlite3");
const database_helpers_js_1 = require("../helpers/database.helpers.js");
function getContractAttachments(contractId, connectedDatabase) {
    const database = connectedDatabase !== null && connectedDatabase !== void 0 ? connectedDatabase : (0, better_sqlite3_1.default)(database_helpers_js_1.sunriseDB, { readonly: true });
    const attachments = database
        .prepare(`select contractAttachmentId,
          attachmentTitle, attachmentDetails,
          fileName, recordCreate_timeMillis
        from ContractAttachments
        where recordDelete_timeMillis is null
          and contractId = ?
        order by contractAttachmentId`)
        .all(contractId);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return attachments;
}
