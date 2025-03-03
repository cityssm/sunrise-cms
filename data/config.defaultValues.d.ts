import type { config as MSSQLConfig } from 'mssql';
import type { ConfigActiveDirectory, ConfigBurialSiteNameSegments, ConfigNtfyStartup, DynamicsGPLookup } from '../types/configTypes.js';
export declare const configDefaultValues: {
    activeDirectory: ConfigActiveDirectory;
    'application.applicationName': string;
    'application.backgroundURL': string;
    'application.logoURL': string;
    'application.httpPort': number;
    'application.userDomain': string;
    'application.useTestDatabases': boolean;
    'application.maximumProcesses': number;
    'application.ntfyStartup': ConfigNtfyStartup | undefined;
    'reverseProxy.disableCompression': boolean;
    'reverseProxy.disableEtag': boolean;
    'reverseProxy.urlPrefix': string;
    'session.cookieName': string;
    'session.secret': string;
    'session.maxAgeMillis': number;
    'session.doKeepAlive': boolean;
    'users.testing': string[];
    'users.canLogin': string[];
    'users.canUpdate': string[];
    'users.isAdmin': string[];
    'aliases.externalReceiptNumber': string;
    'aliases.workOrderOpenDate': string;
    'aliases.workOrderCloseDate': string;
    'settings.cityDefault': string;
    'settings.provinceDefault': string;
    'settings.burialSites.burialSiteNameSegments': ConfigBurialSiteNameSegments;
    'settings.contracts.burialSiteIdIsRequired': boolean;
    'settings.contracts.prints': string[];
    'settings.fees.taxPercentageDefault': number;
    'settings.workOrders.workOrderNumberLength': number;
    'settings.workOrders.workOrderMilestoneDateRecentBeforeDays': number;
    'settings.workOrders.workOrderMilestoneDateRecentAfterDays': number;
    'settings.workOrders.calendarEmailAddress': string;
    'settings.workOrders.prints': string[];
    'settings.adminCleanup.recordDeleteAgeDays': number;
    'settings.printPdf.contentDisposition': "attachment" | "inline";
    'settings.dynamicsGP.integrationIsEnabled': boolean;
    'settings.dynamicsGP.mssqlConfig': MSSQLConfig;
    'settings.dynamicsGP.lookupOrder': DynamicsGPLookup[];
    'settings.dynamicsGP.accountCodes': string[];
    'settings.dynamicsGP.itemNumbers': string[];
    'settings.dynamicsGP.trialBalanceCodes': string[];
};
