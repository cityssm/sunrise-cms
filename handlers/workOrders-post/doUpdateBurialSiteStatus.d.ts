import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    lotId: string;
    burialSiteStatusId: string;
    workOrderId: string;
}>, response: Response): Promise<void>;
