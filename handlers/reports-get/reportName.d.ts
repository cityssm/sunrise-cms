import type { Request, Response } from 'express';
import { type ReportParameters } from '../../database/getReportData.js';
export default function handler(request: Request<{
    reportName: string;
}, unknown, unknown, ReportParameters>, response: Response): void;
