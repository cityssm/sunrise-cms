import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    workOrderId: string;
}>, response: Response): void;
