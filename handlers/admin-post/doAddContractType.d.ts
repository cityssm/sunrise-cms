import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    contractType: string;
    orderNumber?: number | string;
}>, response: Response): Promise<void>;
