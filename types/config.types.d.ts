import type { ActiveDirectoryAuthenticatorConfiguration, ADWebAuthAuthenticatorConfiguration, FunctionAuthenticatorConfiguration, PlainTextAuthenticatorConfiguration } from '@cityssm/authentication-helper';
import type { ConsignoCloudAPIConfig } from '@cityssm/consigno-cloud-api';
import type { config as MSSQLConfig } from 'mssql';
import type { NtfyTopic } from '../integrations/ntfy/types.js';
export interface Config {
    application: ConfigApplication;
    session: ConfigSession;
    /** Reverse Proxy Configuration */
    reverseProxy: {
        /** Disable Compression */
        disableCompression?: boolean;
        /** Disable ETag */
        disableEtag?: boolean;
        /** Disable Rate Limiting */
        disableRateLimit?: boolean;
        /** Is traffic forwarded by a reverse proxy */
        trafficIsForwarded?: boolean;
        /** URL Prefix, should start with a slash, but have no trailing slash */
        urlPrefix?: string;
    };
    login?: {
        authentication: {
            config: ActiveDirectoryAuthenticatorConfiguration;
            type: 'activeDirectory';
        } | {
            config: ADWebAuthAuthenticatorConfiguration;
            type: 'adWebAuth';
        } | {
            config: FunctionAuthenticatorConfiguration;
            type: 'function';
        } | {
            config: PlainTextAuthenticatorConfiguration;
            type: 'plainText';
        };
        domain: string;
    };
    /** Users - Can also be defined in the database */
    users: {
        testing?: Array<`*${string}`>;
        canLogin?: string[];
        canUpdate?: string[];
        canUpdateCemeteries?: string[];
        canUpdateContracts?: string[];
        canUpdateWorkOrders?: string[];
        isAdmin?: string[];
    };
    settings: {
        /** Default City */
        cityDefault?: string;
        /** Default Province */
        provinceDefault?: string;
        enableKeyboardShortcuts?: boolean;
        /** The maximum latitude */
        latitudeMax?: number;
        /** The minimum latitude */
        latitudeMin?: number;
        /** The maximum longitude */
        longitudeMax?: number;
        /** The minimum longitude */
        longitudeMin?: number;
        customizationsPath?: string;
        fees: {
            taxPercentageDefault?: number;
        };
        cemeteries: {
            refreshImageChanges?: boolean;
        };
        burialSites: {
            burialSiteNameSegments?: ConfigBurialSiteNameSegments;
            refreshImageChanges?: boolean;
        };
        contracts: {
            burialSiteIdIsRequired?: boolean;
            contractEndDateIsRequired?: boolean;
            prints?: string[];
        };
        workOrders: {
            calendarEmailAddress?: string;
            prints?: string[];
            workOrderNumberLength?: number;
        };
        adminCleanup: {
            recordDeleteAgeDays?: number;
        };
        printPdf: {
            browser?: 'chrome' | 'firefox';
            contentDisposition?: 'attachment' | 'inline';
        };
        databaseBackup: {
            taskIsEnabled: boolean;
            backupHour?: number;
            deleteAgeDays?: number;
        };
    };
    integrations: {
        dynamicsGP?: {
            integrationIsEnabled: boolean;
            mssqlConfig?: MSSQLConfig;
            accountCodes?: string[];
            itemNumbers?: string[];
            lookupOrder?: DynamicsGPLookup[];
            trialBalanceCodes?: string[];
        };
        consignoCloud?: Partial<ConsignoCloudAPIConfig> & {
            integrationIsEnabled: boolean;
        };
        ntfy?: {
            integrationIsEnabled: boolean;
            server?: string;
            topics?: Partial<Record<NtfyTopic, string>>;
        };
    };
}
export type DynamicsGPLookup = 'diamond/cashReceipt' | 'diamond/extendedInvoice' | 'invoice';
interface ConfigApplication {
    applicationName?: string;
    httpPort?: number;
    /** The base, public facing URL of the application, including the protocol (http or https), and any URL prefixes */
    applicationUrl?: string;
    backgroundURL?: string;
    logoURL?: string;
    /** The maximum number of concurrent processes */
    maximumProcesses?: number;
    /** Use test databases */
    useTestDatabases?: boolean;
    attachmentsPath?: string;
    /** In megabytes */
    maxAttachmentFileSize?: number;
}
interface ConfigSession {
    cookieName?: string;
    maxAgeMillis?: number;
    secret?: string;
    doKeepAlive?: boolean;
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
