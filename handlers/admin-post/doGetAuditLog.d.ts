import type { Request, Response } from 'express';
import { type AuditLogEntry, type AuditLogMainRecordType } from '../../database/getAuditLog.js';
export type DoGetAuditLogResponse = {
    auditLogEntries: AuditLogEntry[];
};
export default function handler(request: Request<unknown, unknown, {
    logDate?: string;
    mainRecordType?: AuditLogMainRecordType;
}>, response: Response<DoGetAuditLogResponse>): void;
