"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    application: {},
    reverseProxy: {},
    session: {},
    settings: {
        adminCleanup: {},
        burialSites: {},
        cemeteries: {},
        contracts: {},
        fees: {},
        printPdf: {},
        workOrders: {}
    },
    integrations: {
        consignoCloud: {
            integrationIsEnabled: false
        },
        dynamicsGP: {
            integrationIsEnabled: false
        }
    },
    users: {}
};
exports.default = exports.config;
