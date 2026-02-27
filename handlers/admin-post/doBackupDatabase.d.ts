import type { Request, Response } from 'express';
export type DoBackupDatabaseResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    fileName: string | undefined;
};
export default function handler(_request: Request, response: Response<DoBackupDatabaseResponse>): Promise<void>;
