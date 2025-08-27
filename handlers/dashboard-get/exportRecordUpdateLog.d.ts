import type { Request, Response } from 'express';
import { type RecordType } from '../../database/getRecordUpdateLog.js';
export default function handler(request: Request<unknown, unknown, unknown, {
    recordType?: '' | RecordType;
}>, response: Response): void;
