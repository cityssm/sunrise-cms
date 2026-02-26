import type { Request, Response } from 'express';
import type { WorkOrderMilestoneType } from '../../types/record.types.js';
export type DoUpdateWorkOrderMilestoneTypeResponse = {
    success: boolean;
    workOrderMilestoneTypes: WorkOrderMilestoneType[];
};
export default function handler(request: Request<unknown, unknown, {
    workOrderMilestoneTypeId: string;
    workOrderMilestoneType: string;
}>, response: Response<DoUpdateWorkOrderMilestoneTypeResponse>): void;
