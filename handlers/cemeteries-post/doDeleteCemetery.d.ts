import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    cemeteryId: string | number;
}>, response: Response): Promise<void>;
