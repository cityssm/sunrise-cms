import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    burialSiteId: number;
}>, response: Response): void;
