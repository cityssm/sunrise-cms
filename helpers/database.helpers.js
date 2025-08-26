"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupFolder = exports.sunriseDB = exports.sunriseDBTesting = exports.sunriseDBLive = exports.useTestDatabases = void 0;
exports.sanitizeLimit = sanitizeLimit;
exports.sanitizeOffset = sanitizeOffset;
exports.getLastBackupDate = getLastBackupDate;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const debug_1 = require("debug");
const debug_config_js_1 = require("../debug.config.js");
const config_helpers_js_1 = require("./config.helpers.js");
const debug = (0, debug_1.default)(`${debug_config_js_1.DEBUG_NAMESPACE}:helpers:database:${process.pid.toString().padEnd(5)}`);
exports.useTestDatabases = (0, config_helpers_js_1.getConfigProperty)('application.useTestDatabases') ||
    process.env.TEST_DATABASES === 'true';
if (exports.useTestDatabases) {
    debug('Using "-testing" databases.');
}
exports.sunriseDBLive = 'data/sunrise.db';
exports.sunriseDBTesting = 'data/sunrise-testing.db';
exports.sunriseDB = exports.useTestDatabases ? exports.sunriseDBTesting : exports.sunriseDBLive;
exports.backupFolder = 'data/backups';
function sanitizeLimit(limit) {
    const limitNumber = Number(limit);
    if (Number.isNaN(limitNumber) || limitNumber < 0) {
        return 50;
    }
    return Math.floor(limitNumber);
}
function sanitizeOffset(offset) {
    const offsetNumber = Number(offset);
    if (Number.isNaN(offsetNumber) || offsetNumber < 0) {
        return 0;
    }
    return Math.floor(offsetNumber);
}
async function getLastBackupDate() {
    let lastBackupDate = undefined;
    const filesInBackup = await promises_1.default.readdir(exports.backupFolder);
    for (const file of filesInBackup) {
        if (!file.includes('.db.')) {
            continue;
        }
        const filePath = node_path_1.default.join(exports.backupFolder, file);
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const stats = await promises_1.default.stat(filePath);
        if (lastBackupDate === undefined ||
            stats.mtime.getTime() > lastBackupDate.getTime()) {
            lastBackupDate = stats.mtime;
        }
    }
    return lastBackupDate;
}
