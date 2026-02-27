import type { Request, Response } from 'express';
import type { WorkOrderMilestone } from '../../types/record.types.js';
export type DoCompleteWorkOrderMilestoneResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    workOrderMilestones: WorkOrderMilestone[];
};
export default function handler(request: Request<unknown, unknown, {
    workOrderId: string;
    workOrderMilestoneId: string;
}>, response: Response<DoCompleteWorkOrderMilestoneResponse>): Promise<void>;
