import type { Request, Response } from 'express';
import type { WorkOrderMilestoneType } from '../../types/record.types.js';
export type DoAddWorkOrderMilestoneTypeResponse = {
    success: true;
    workOrderMilestoneTypeId: number;
    workOrderMilestoneTypes: WorkOrderMilestoneType[];
};
export default function handler(request: Request<unknown, unknown, {
    workOrderMilestoneType: string;
    orderNumber?: number | string;
}>, response: Response<DoAddWorkOrderMilestoneTypeResponse>): void;
