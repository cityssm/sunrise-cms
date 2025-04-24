import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    workOrderMilestoneType: string;
    orderNumber?: number | string;
}>, response: Response): void;
