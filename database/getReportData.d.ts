export type ReportParameters = Record<string, number | string>;
export default function getReportData(reportName: string, reportParameters?: ReportParameters): Promise<undefined | unknown[]>;
