import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    burialSiteId: string;
    workOrderId: string;
}>, response: Response): Promise<void>;
