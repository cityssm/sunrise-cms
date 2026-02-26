import type { Request, Response } from 'express';
import type { WorkOrderMilestone } from '../../types/record.types.js';
export type DoCompleteWorkOrderMilestoneResponse = {
    success: boolean;
    workOrderMilestones: WorkOrderMilestone[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    workOrderId: string;
    workOrderMilestoneId: string;
}>, response: Response<DoCompleteWorkOrderMilestoneResponse>): Promise<void>;
