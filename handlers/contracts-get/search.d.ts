import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, unknown, {
    cemeteryId?: string;
    contractNumber?: string;
    deceasedName?: string;
    error?: string;
}>, response: Response): void;
