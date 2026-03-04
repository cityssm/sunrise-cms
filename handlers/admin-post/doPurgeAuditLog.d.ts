import type { Request, Response } from 'express';
export type DoPurgeAuditLogResponse = {
    message: string;
    success: false;
} | {
    purgedCount: number;
    success: true;
};
export default function handler(request: Request<unknown, unknown, {
    age?: string;
}>, response: Response<DoPurgeAuditLogResponse>): void;
