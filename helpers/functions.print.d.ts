import type { BurialSite, Contract, WorkOrder } from '../types/recordTypes.js';
interface PrintConfig {
    params: string[];
    title: string;
}
interface ReportData {
    headTitle: string;
    burialSite?: BurialSite;
    contract?: Contract;
    workOrder?: WorkOrder;
    configFunctions: unknown;
    contractFunctions: unknown;
    dateTimeFunctions: unknown;
}
export declare function getScreenPrintConfig(printName: string): PrintConfig | undefined;
export declare function getPdfPrintConfig(printName: string): PrintConfig | undefined;
export declare function getPrintConfig(screenOrPdfPrintName: string): PrintConfig | undefined;
export declare function getReportData(printConfig: PrintConfig, requestQuery: Record<string, unknown>): Promise<ReportData>;
export {};
