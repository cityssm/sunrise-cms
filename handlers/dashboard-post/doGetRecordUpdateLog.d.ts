import type { Request, Response } from 'express';
import { type RecordType } from '../../database/getRecordUpdateLog.js';
export default function handler(request: Request<unknown, unknown, {
    limit?: number | string;
    offset?: number | string;
    recordType?: '' | RecordType;
    sortBy?: 'recordCreate_timeMillis' | 'recordUpdate_timeMillis';
    sortDirection?: 'asc' | 'desc';
}>, response: Response): void;
