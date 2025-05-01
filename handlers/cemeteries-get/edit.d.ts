import type { Request, Response } from 'express';
export default function handler(request: Request<{
    cemeteryId: string;
}>, response: Response): Promise<void>;
