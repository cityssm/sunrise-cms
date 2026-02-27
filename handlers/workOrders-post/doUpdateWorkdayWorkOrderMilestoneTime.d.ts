import type { DateString } from '@cityssm/utils-datetime';
import type { Request, Response } from 'express';
import { type UpdateWorkOrderMilestoneTimeForm } from '../../database/updateWorkOrderMilestoneTime.js';
import type { WorkOrder } from '../../types/record.types.js';
export type DoUpdateWorkdayWorkOrderMilestoneTimeResponse = {
    errorMessage: string;
    success: false;
} | {
    success: boolean;
    workOrders: WorkOrder[];
};
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderMilestoneTimeForm & {
    workdayDateString: DateString;
}>, response: Response<DoUpdateWorkdayWorkOrderMilestoneTimeResponse>): Promise<void>;
