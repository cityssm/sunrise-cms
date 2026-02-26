import type { Request, Response } from 'express';
import { type AddWorkOrderMilestoneForm } from '../../database/addWorkOrderMilestone.js';
import type { WorkOrderMilestone } from '../../types/record.types.js';
export type DoAddWorkOrderMilestoneResponse = {
    success: number;
    workOrderMilestones: WorkOrderMilestone[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, AddWorkOrderMilestoneForm>, response: Response<DoAddWorkOrderMilestoneResponse>): Promise<void>;
