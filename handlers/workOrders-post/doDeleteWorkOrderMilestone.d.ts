import type { Request, Response } from 'express';
import type { WorkOrderMilestone } from '../../types/record.types.js';
export type DoDeleteWorkOrderMilestoneResponse = {
    errorMessage: string;
    success: false;
} | {
    success: boolean;
    workOrderMilestones: WorkOrderMilestone[];
};
export default function handler(request: Request<unknown, unknown, {
    workOrderId: string;
    workOrderMilestoneId: string;
}>, response: Response<DoDeleteWorkOrderMilestoneResponse>): Promise<void>;
