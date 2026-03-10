import { type DateString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import type { AuditLogEntry } from '../types/record.types.js';
export type AuditLogMainRecordType = '' | 'burialSite' | 'burialSiteStatus' | 'burialSiteType' | 'cemetery' | 'committalType' | 'contract' | 'contractType' | 'fee' | 'funeralHome' | 'intermentContainerType' | 'intermentDepth' | 'serviceType' | 'user' | 'workOrder' | 'workOrderMilestoneType' | 'workOrderType';
export declare const defaultAuditLogLimit = 50;
export default function getAuditLog(filters: {
    logDateFrom?: '' | DateString;
    logDateTo?: '' | DateString;
    mainRecordType?: AuditLogMainRecordType;
    mainRecordId?: number | string;
    updateUserName?: string;
}, options?: {
    limit?: number;
    offset?: number;
}, connectedDatabase?: sqlite.Database): {
    auditLogEntries: AuditLogEntry[];
    count: number;
};
