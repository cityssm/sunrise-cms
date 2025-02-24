import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    burialSiteStatusId: string;
    burialSiteStatus: string;
}>, response: Response): Promise<void>;
