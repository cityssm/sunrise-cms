import sqlite from 'better-sqlite3';
export type AuditLogMainRecordType = '' | 'burialSite' | 'burialSiteStatus' | 'cemetery' | 'committalType' | 'contract' | 'intermentContainerType' | 'intermentDepth' | 'serviceType' | 'user' | 'workOrder' | 'workOrderMilestoneType' | 'workOrderType';
export interface AuditLogEntry {
    logMillis: number;
    logDate: number;
    logTime: number;
    mainRecordType: string;
    mainRecordId: string;
    updateTable: string;
    recordIndex: string | null;
    updateField: string;
    updateType: string;
    updateUserName: string;
    fromValue: string | null;
    toValue: string | null;
}
export declare const defaultAuditLogLimit = 50;
export default function getAuditLog(filters: {
    logDateFrom?: string;
    logDateTo?: string;
    mainRecordType?: AuditLogMainRecordType;
    updateUserName?: string;
}, options?: {
    limit?: number;
    offset?: number;
}, connectedDatabase?: sqlite.Database): {
    auditLogEntries: AuditLogEntry[];
    count: number;
};
