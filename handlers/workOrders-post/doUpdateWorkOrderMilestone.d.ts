import type { Request, Response } from 'express';
import { type UpdateWorkOrderMilestoneForm } from '../../database/updateWorkOrderMilestone.js';
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderMilestoneForm & {
    workOrderId: string;
}>, response: Response): Promise<void>;
