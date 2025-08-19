import * as dateTimeFunctions from '@cityssm/utils-datetime';
import JsBarcode from 'jsbarcode';
import type { PrintConfig } from 'sunrise-cms-customizations';
import xmldom from 'xmldom';
import type { BurialSite, Contract, WorkOrder } from '../types/record.types.js';
import { getCachedSettingValue } from './cache/settings.cache.js';
import * as configFunctions from './config.helpers.js';
import * as contractFunctions from './contracts.helpers.js';
interface ReportData {
    headTitle: string;
    burialSite?: BurialSite;
    contract?: Contract;
    workOrder?: WorkOrder;
    configFunctions: typeof configFunctions;
    contractFunctions: typeof contractFunctions;
    dateTimeFunctions: typeof dateTimeFunctions;
    settingFunctions: {
        getSettingValue: typeof getCachedSettingValue;
    };
    libraries: {
        JsBarcode: typeof JsBarcode;
        xmldom: typeof xmldom;
    };
}
export interface PrintConfigWithPath extends PrintConfig {
    path: string;
}
export declare function getScreenPrintConfig(printName: string): PrintConfig | undefined;
export declare function getPdfPrintConfig(printName: string): PrintConfigWithPath | undefined;
export declare function getPrintConfig(screenOrPdfPrintName: string): PrintConfig | PrintConfigWithPath | undefined;
export declare function getReportData(printConfig: PrintConfig, requestQuery: Record<string, unknown>): Promise<ReportData>;
export {};
