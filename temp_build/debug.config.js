"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEBUG_ENABLE_NAMESPACES = exports.DEBUG_NAMESPACE = void 0;
var debug_1 = require("@cityssm/consigno-cloud-api/debug");
var debug_2 = require("@cityssm/dynamics-gp/debug");
var debug_3 = require("@cityssm/pdf-puppeteer/debug");
var debug_4 = require("@cityssm/scheduled-task/debug");
exports.DEBUG_NAMESPACE = 'sunrise';
exports.DEBUG_ENABLE_NAMESPACES = [
    "".concat(exports.DEBUG_NAMESPACE, ":*"),
    debug_1.DEBUG_ENABLE_NAMESPACES,
    debug_2.DEBUG_ENABLE_NAMESPACES,
    debug_3.DEBUG_ENABLE_NAMESPACES,
    debug_4.DEBUG_ENABLE_NAMESPACES
].join(',');
