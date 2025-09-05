import sqlite from 'better-sqlite3';
export type ReportParameters = Record<string, number | string>;
export default function getReportData(reportName: string, reportParameters?: ReportParameters, connectedDatabase?: sqlite.Database | undefined): unknown[] | undefined;
