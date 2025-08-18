import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, unknown, {
    cemeteryId?: string;
    deceasedName?: string;
}>, response: Response): void;
