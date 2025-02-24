import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    burialSiteStatusId: string;
}>, response: Response): Promise<void>;
