import type { Request, Response } from 'express';
import type { WorkOrderMilestone } from '../../types/record.types.js';
export type DoGetWorkOrderMilestonesResponse = {
    workOrderMilestones: WorkOrderMilestone[];
};
export default function handler(request: Request, response: Response<DoGetWorkOrderMilestonesResponse>): Promise<void>;
