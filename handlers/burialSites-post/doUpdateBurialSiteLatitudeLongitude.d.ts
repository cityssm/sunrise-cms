import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    burialSiteId: string;
    burialSiteLatitude: string;
    burialSiteLongitude: string;
}>, response: Response): void;
