import type { config as MSSQLConfig } from 'mssql';
export interface Config {
    application: ConfigApplication;
    session: ConfigSession;
    reverseProxy: {
        disableCompression?: boolean;
        disableEtag?: boolean;
        urlPrefix?: string;
    };
    activeDirectory?: ConfigActiveDirectory;
    users: {
        testing?: Array<`*${string}`>;
        canLogin?: string[];
        canUpdate?: string[];
        isAdmin?: string[];
    };
    aliases: {
        externalReceiptNumber?: string;
        workOrderCloseDate?: string;
        workOrderOpenDate?: string;
    };
    settings: {
        cityDefault?: string;
        provinceDefault?: string;
        latitudeMax?: number;
        latitudeMin?: number;
        longitudeMax?: number;
        longitudeMin?: number;
        fees: {
            taxPercentageDefault?: number;
        };
        burialSites: {
            burialSiteNameSegments?: ConfigBurialSiteNameSegments;
        };
        contracts: {
            burialSiteIdIsRequired?: boolean;
            contractEndDateIsRequired?: boolean;
            deathAgePeriods?: string[];
            prints?: string[];
            purchaserRelationships?: string[];
        };
        workOrders: {
            calendarEmailAddress?: string;
            prints?: string[];
            workOrderMilestoneDateRecentAfterDays?: number;
            workOrderMilestoneDateRecentBeforeDays?: number;
            workOrderNumberLength?: number;
        };
        adminCleanup: {
            recordDeleteAgeDays?: number;
        };
        printPdf: {
            browser?: 'chrome' | 'firefox';
            contentDisposition?: 'attachment' | 'inline';
        };
        dynamicsGP?: {
            integrationIsEnabled: boolean;
            mssqlConfig?: MSSQLConfig;
            lookupOrder?: DynamicsGPLookup[];
            accountCodes?: string[];
            itemNumbers?: string[];
            trialBalanceCodes?: string[];
        };
    };
}
export type DynamicsGPLookup = 'diamond/cashReceipt' | 'diamond/extendedInvoice' | 'invoice';
interface ConfigApplication {
    applicationName?: string;
    backgroundURL?: string;
    logoURL?: string;
    httpPort?: number;
    userDomain?: string;
    useTestDatabases?: boolean;
    ntfyStartup?: ConfigNtfyStartup;
    maximumProcesses?: number;
}
export interface ConfigNtfyStartup {
    server?: string;
    topic: string;
}
interface ConfigSession {
    cookieName?: string;
    doKeepAlive?: boolean;
    maxAgeMillis?: number;
    secret?: string;
}
export interface ConfigActiveDirectory {
    url: string;
    baseDN: string;
    username: string;
    password: string;
}
export interface ConfigBurialSiteNameSegments {
    includeCemeteryKey?: boolean;
    segments: Partial<Record<'1' | '2' | '3' | '4' | '5', {
        isAvailable?: boolean;
        isRequired?: boolean;
        label?: string;
        maxLength?: number;
        minLength?: number;
        prefix?: string;
        suffix?: string;
    }>>;
    separator?: string;
}
export {};
