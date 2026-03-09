import type { Request, Response } from 'express';
export type DoCleanupDatabaseResponse = {
    inactivatedRecordCount: number;
    purgedRecordCount: number;
};
export default function handler(request: Request, response: Response<DoCleanupDatabaseResponse>): Promise<void>;
