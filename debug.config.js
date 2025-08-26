"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEBUG_ENABLE_NAMESPACES = exports.DEBUG_NAMESPACE = void 0;
const debug_1 = require("@cityssm/consigno-cloud-api/debug");
const debug_2 = require("@cityssm/dynamics-gp/debug");
const debug_3 = require("@cityssm/pdf-puppeteer/debug");
const debug_4 = require("@cityssm/scheduled-task/debug");
exports.DEBUG_NAMESPACE = 'sunrise';
exports.DEBUG_ENABLE_NAMESPACES = [
    `${exports.DEBUG_NAMESPACE}:*`,
    debug_1.DEBUG_ENABLE_NAMESPACES,
    debug_2.DEBUG_ENABLE_NAMESPACES,
    debug_3.DEBUG_ENABLE_NAMESPACES,
    debug_4.DEBUG_ENABLE_NAMESPACES
].join(',');
