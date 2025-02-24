import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    burialSiteTypeId: string;
    burialSiteType: string;
}>, response: Response): Promise<void>;
