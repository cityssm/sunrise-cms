import { config as cemeteryConfig } from './ontario.partialConfig.js';
export const config = { ...cemeteryConfig };
config.settings.customizationsPath = '../sunrise-cms-saultstemarie';
config.settings.burialSites.burialSiteNameSegments = {
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
config.settings.cityDefault = 'Sault Ste. Marie';
config.settings.latitudeMax = 46.75;
config.settings.latitudeMin = 46.4;
config.settings.longitudeMax = -84.2;
config.settings.longitudeMin = -84.5;
config.settings.contracts.prints = [
    'pdf/ssm.contract.burialPermit',
    'pdf/ssm.contract'
];
config.settings.printPdf.browser = 'firefox';
config.settings.databaseBackup.taskIsEnabled = true;
config.settings.workOrders.workOrderNumberLength = 6;
config.settings.workOrders.workOrderMilestoneDateRecentBeforeDays = 7;
config.settings.workOrders.workOrderMilestoneDateRecentAfterDays = 30;
config.integrations.dynamicsGP = {
    integrationIsEnabled: true,
    lookupOrder: ['diamond/cashReceipt', 'diamond/extendedInvoice']
};
export default config;
