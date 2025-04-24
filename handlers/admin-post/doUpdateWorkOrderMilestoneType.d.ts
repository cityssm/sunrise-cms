import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    workOrderMilestoneTypeId: string;
    workOrderMilestoneType: string;
}>, response: Response): void;
