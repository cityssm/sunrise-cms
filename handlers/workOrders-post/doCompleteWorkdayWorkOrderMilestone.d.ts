import type { DateString } from '@cityssm/utils-datetime';
import type { Request, Response } from 'express';
import type { WorkOrder } from '../../types/record.types.js';
export type DoCompleteWorkdayWorkOrderMilestoneResponse = {
    errorMessage: string;
    success: false;
} | {
    success: boolean;
    workOrders: WorkOrder[];
};
export default function handler(request: Request<unknown, unknown, {
    workdayDateString: DateString;
    workOrderMilestoneId: string;
}>, response: Response<DoCompleteWorkdayWorkOrderMilestoneResponse>): Promise<void>;
