import type { Request, Response } from 'express';
import { type UpdateWorkOrderMilestoneForm } from '../../database/updateWorkOrderMilestone.js';
import type { WorkOrderMilestone } from '../../types/record.types.js';
export type DoUpdateWorkOrderMilestoneResponse = {
    success: boolean;
    workOrderMilestones: WorkOrderMilestone[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderMilestoneForm & {
    workOrderId: string;
}>, response: Response<DoUpdateWorkOrderMilestoneResponse>): Promise<void>;
