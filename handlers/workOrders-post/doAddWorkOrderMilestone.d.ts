import type { Request, Response } from 'express';
import { type AddWorkOrderMilestoneForm } from '../../database/addWorkOrderMilestone.js';
import type { WorkOrderMilestone } from '../../types/record.types.js';
export type DoAddWorkOrderMilestoneResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    workOrderMilestoneId: number;
    workOrderMilestones: WorkOrderMilestone[];
};
export default function handler(request: Request<unknown, unknown, AddWorkOrderMilestoneForm>, response: Response<DoAddWorkOrderMilestoneResponse>): Promise<void>;
