import type { PrintConfig } from 'sunrise-cms-customizations';
import type { BurialSite, Contract, WorkOrder } from '../types/record.types.js';
interface ReportData {
    headTitle: string;
    burialSite?: BurialSite;
    contract?: Contract;
    workOrder?: WorkOrder;
    configFunctions: unknown;
    contractFunctions: unknown;
    dateTimeFunctions: unknown;
}
type PrintConfigWithPath = PrintConfig & {
    path: string;
};
export declare function getScreenPrintConfig(printName: string): PrintConfig | undefined;
export declare function getPdfPrintConfig(printName: string): PrintConfigWithPath | undefined;
export declare function getPrintConfig(screenOrPdfPrintName: string): PrintConfig | undefined;
export declare function getReportData(printConfig: PrintConfig, requestQuery: Record<string, unknown>): Promise<ReportData>;
export {};
