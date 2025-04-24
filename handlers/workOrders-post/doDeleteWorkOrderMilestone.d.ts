import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    workOrderId: string;
    workOrderMilestoneId: string;
}>, response: Response): Promise<void>;
