import type { DateString } from '@cityssm/utils-datetime';
import type { Request, Response } from 'express';
import { type AuditLogEntry, type AuditLogMainRecordType } from '../../database/getAuditLog.js';
export type DoGetAuditLogResponse = {
    auditLogEntries: AuditLogEntry[];
    count: number;
    offset: number;
};
export default function handler(request: Request<unknown, unknown, {
    logDateFrom?: '' | DateString;
    logDateTo?: '' | DateString;
    mainRecordType?: AuditLogMainRecordType;
    updateUserName?: string;
    limit?: number | string;
    offset?: number | string;
}>, response: Response<DoGetAuditLogResponse>): void;
