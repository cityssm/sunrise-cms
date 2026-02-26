import type { DateString } from '@cityssm/utils-datetime';
import type { Request, Response } from 'express';
import type { WorkOrder } from '../../types/record.types.js';
export type DoReopenWorkdayWorkOrderMilestoneResponse = {
    success: boolean;
    workOrders: WorkOrder[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    workdayDateString: DateString;
    workOrderMilestoneId: string;
}>, response: Response<DoReopenWorkdayWorkOrderMilestoneResponse>): Promise<void>;
