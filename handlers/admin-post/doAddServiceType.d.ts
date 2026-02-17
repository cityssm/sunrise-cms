import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    serviceType: string;
    orderNumber?: number | string;
}>, response: Response): void;
