import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    lotType: string;
    orderNumber?: string | number;
}>, response: Response): Promise<void>;
