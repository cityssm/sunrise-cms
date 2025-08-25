"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupFolder = exports.sunriseDB = exports.sunriseDBTesting = exports.sunriseDBLive = exports.useTestDatabases = void 0;
exports.sanitizeLimit = sanitizeLimit;
exports.sanitizeOffset = sanitizeOffset;
exports.getLastBackupDate = getLastBackupDate;
var promises_1 = require("node:fs/promises");
var node_path_1 = require("node:path");
var debug_1 = require("debug");
var debug_config_js_1 = require("../debug.config.js");
var config_helpers_js_1 = require("./config.helpers.js");
var debug = (0, debug_1.default)("".concat(debug_config_js_1.DEBUG_NAMESPACE, ":helpers:database:").concat(process.pid.toString().padEnd(5)));
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
    var limitNumber = Number(limit);
    if (Number.isNaN(limitNumber) || limitNumber < 0) {
        return 50;
    }
    return Math.floor(limitNumber);
}
function sanitizeOffset(offset) {
    var offsetNumber = Number(offset);
    if (Number.isNaN(offsetNumber) || offsetNumber < 0) {
        return 0;
    }
    return Math.floor(offsetNumber);
}
function getLastBackupDate() {
    return __awaiter(this, void 0, void 0, function () {
        var lastBackupDate, filesInBackup, _i, filesInBackup_1, file, filePath, stats;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lastBackupDate = undefined;
                    return [4 /*yield*/, promises_1.default.readdir(exports.backupFolder)];
                case 1:
                    filesInBackup = _a.sent();
                    _i = 0, filesInBackup_1 = filesInBackup;
                    _a.label = 2;
                case 2:
                    if (!(_i < filesInBackup_1.length)) return [3 /*break*/, 5];
                    file = filesInBackup_1[_i];
                    if (!file.includes('.db.')) {
                        return [3 /*break*/, 4];
                    }
                    filePath = node_path_1.default.join(exports.backupFolder, file);
                    return [4 /*yield*/, promises_1.default.stat(filePath)];
                case 3:
                    stats = _a.sent();
                    if (lastBackupDate === undefined ||
                        stats.mtime.getTime() > lastBackupDate.getTime()) {
                        lastBackupDate = stats.mtime;
                    }
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, lastBackupDate];
            }
        });
    });
}
