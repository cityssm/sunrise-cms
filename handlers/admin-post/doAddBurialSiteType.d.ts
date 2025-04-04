import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    burialSiteType: string;
    orderNumber?: number | string;
}>, response: Response): Promise<void>;
