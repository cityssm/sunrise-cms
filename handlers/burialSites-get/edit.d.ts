import type { Request, Response } from 'express';
export default function handler(request: Request<{
    burialSiteId: string;
}>, response: Response): Promise<void>;
