import type { Request, Response } from 'express';
import { type AuditLogMainRecordType } from '../../database/getAuditLog.js';
import type { AuditLogEntry } from '../../types/record.types.js';
export type DoGetRecordAuditLogResponse = {
    auditLogEntries: AuditLogEntry[];
    count: number;
    offset: number;
};
type RequestBody = {
    mainRecordType?: AuditLogMainRecordType;
    mainRecordId?: number | string;
    limit?: number | string;
    offset?: number | string;
};
/**
 * Returns a route handler that only serves audit log entries for the given
 * `expectedMainRecordType`.  Any request that supplies a different (or
 * missing) `mainRecordType` in the body is rejected with 403 Forbidden.
 */
export default function createHandler(expectedMainRecordType: AuditLogMainRecordType): (request: Request<unknown, unknown, RequestBody>, response: Response) => void;
export {};
