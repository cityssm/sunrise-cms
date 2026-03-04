import sqlite from 'better-sqlite3';
export type AuditLogMainRecordType = '' | 'burialSite' | 'cemetery' | 'contract' | 'user' | 'workOrder';
export interface AuditLogEntry {
    logMillis: number;
    logDate: number;
    logTime: number;
    mainRecordType: string;
    mainRecordId: number;
    updateTable: string;
    recordIndex: string | null;
    updateField: string;
    updateType: string;
    updateUserName: string;
    fromValue: string | null;
    toValue: string | null;
}
export default function getAuditLog(filters: {
    logDate?: string;
    mainRecordType?: AuditLogMainRecordType;
}, connectedDatabase?: sqlite.Database): AuditLogEntry[];
