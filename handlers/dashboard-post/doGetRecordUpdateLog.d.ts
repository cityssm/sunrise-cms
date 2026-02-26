import type { Request, Response } from 'express';
import { type RecordType } from '../../database/getRecordUpdateLog.js';
import type { RecordUpdateLog } from '../../database/getRecordUpdateLog.js';
export type DoGetRecordUpdateLogResponse = {
    updateLog: RecordUpdateLog[];
};
export default function handler(request: Request<unknown, unknown, {
    limit?: number | string;
    offset?: number | string;
    recordType?: '' | RecordType;
    sortBy?: 'recordCreate_timeMillis' | 'recordUpdate_timeMillis';
    sortDirection?: 'asc' | 'desc';
}>, response: Response<DoGetRecordUpdateLogResponse>): void;
