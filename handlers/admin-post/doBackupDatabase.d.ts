import type { Request, Response } from 'express';
export type DoBackupDatabaseResponse = {
    success: true;
    fileName: string | undefined;
} | {
    success: false;
    errorMessage: string;
};
export default function handler(_request: Request, response: Response<DoBackupDatabaseResponse>): Promise<void>;
