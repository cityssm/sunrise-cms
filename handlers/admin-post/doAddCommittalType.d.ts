import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    committalType: string;
    orderNumber?: number | string;
}>, response: Response): void;
