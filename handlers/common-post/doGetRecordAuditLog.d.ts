import type { Request, Response } from 'express';
import { type AuditLogMainRecordType } from '../../database/getAuditLog.js';
import type { AuditLogEntry } from '../../types/record.types.js';
export type DoGetRecordAuditLogResponse = {
    auditLogEntries: AuditLogEntry[];
    count: number;
    offset: number;
};
export default function handler(request: Request<unknown, unknown, {
    mainRecordType?: AuditLogMainRecordType;
    mainRecordId?: number | string;
    limit?: number | string;
    offset?: number | string;
}>, response: Response<DoGetRecordAuditLogResponse>): void;
