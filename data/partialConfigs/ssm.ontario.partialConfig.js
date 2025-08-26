"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const ontario_partialConfig_js_1 = require("./ontario.partialConfig.js");
exports.config = { ...ontario_partialConfig_js_1.config };
exports.config.settings.customizationsPath = '../sunrise-cms-saultstemarie';
exports.config.settings.burialSites.burialSiteNameSegments = {
    includeCemeteryKey: true,
    separator: '-',
    segments: {
        1: {
            isAvailable: true,
            isRequired: false,
            label: 'Block',
            maxLength: 1,
            minLength: 1
        },
        2: {
            isAvailable: true,
            isRequired: false,
            label: 'Range',
            maxLength: 3,
            minLength: 1
        },
        3: {
            isAvailable: true,
            isRequired: true,
            label: 'Lot',
            maxLength: 4,
            minLength: 1
        },
        4: {
            isAvailable: true,
            isRequired: true,
            label: 'Grave',
            maxLength: 2,
            minLength: 1
        }
    }
};
exports.config.settings.cityDefault = 'Sault Ste. Marie';
exports.config.settings.latitudeMax = 46.75;
exports.config.settings.latitudeMin = 46.4;
exports.config.settings.longitudeMax = -84.2;
exports.config.settings.longitudeMin = -84.5;
exports.config.settings.contracts.prints = [
    'pdf/ssm.contract.burialPermit',
    'pdf/ssm.contract'
];
exports.config.settings.printPdf.browser = 'firefox';
exports.config.settings.workOrders.workOrderNumberLength = 6;
exports.config.settings.workOrders.workOrderMilestoneDateRecentBeforeDays = 7;
exports.config.settings.workOrders.workOrderMilestoneDateRecentAfterDays = 30;
exports.config.integrations.dynamicsGP = {
    integrationIsEnabled: true,
    lookupOrder: ['diamond/cashReceipt', 'diamond/extendedInvoice']
};
exports.default = exports.config;
