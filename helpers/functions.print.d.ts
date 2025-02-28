import type { BurialSite, Contract, WorkOrder } from '../types/recordTypes.js';
interface PrintConfig {
    title: string;
    params: string[];
}
interface ReportData {
    headTitle: string;
    burialSite?: BurialSite;
    contract?: Contract;
    workOrder?: WorkOrder;
    configFunctions: unknown;
    dateTimeFunctions: unknown;
    contractFunctions: unknown;
}
export declare function getScreenPrintConfig(printName: string): PrintConfig | undefined;
export declare function getPdfPrintConfig(printName: string): PrintConfig | undefined;
export declare function getPrintConfig(screenOrPdfPrintName: string): PrintConfig | undefined;
export declare function getReportData(printConfig: PrintConfig, requestQuery: Record<string, unknown>): Promise<ReportData>;
export {};
