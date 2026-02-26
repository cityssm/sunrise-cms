import type { DateString } from '@cityssm/utils-datetime';
import type { Request, Response } from 'express';
import type { WorkOrder } from '../../types/record.types.js';
export type DoCloseWorkdayWorkOrderResponse = {
    success: boolean;
    workOrders: WorkOrder[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    workdayDateString: DateString;
    workOrderId: string;
}>, response: Response<DoCloseWorkdayWorkOrderResponse>): Promise<void>;
