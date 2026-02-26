import type { Request, Response } from 'express';
import type { WorkOrderMilestoneType } from '../../types/record.types.js';
export type DoMoveWorkOrderMilestoneTypeUpResponse = {
    success: boolean;
    workOrderMilestoneTypes: WorkOrderMilestoneType[];
};
export default function handler(request: Request<unknown, unknown, {
    workOrderMilestoneTypeId: string;
    moveToEnd: '0' | '1';
}>, response: Response<DoMoveWorkOrderMilestoneTypeUpResponse>): void;
