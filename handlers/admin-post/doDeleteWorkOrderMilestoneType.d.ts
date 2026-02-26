import type { Request, Response } from 'express';
import type { WorkOrderMilestoneType } from '../../types/record.types.js';
export type DoDeleteWorkOrderMilestoneTypeResponse = {
    success: boolean;
    workOrderMilestoneTypes: WorkOrderMilestoneType[];
};
export default function handler(request: Request<unknown, unknown, {
    workOrderMilestoneTypeId: string;
}>, response: Response<DoDeleteWorkOrderMilestoneTypeResponse>): void;
