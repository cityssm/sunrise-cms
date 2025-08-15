import type { Request, Response } from 'express';
export default function handler(request: Request<{
    workOrderNumber: string;
}>, response: Response): Promise<void>;
