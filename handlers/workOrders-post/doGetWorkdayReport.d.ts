import type { DateString } from '@cityssm/utils-datetime';
import type { Request, Response } from 'express';
import type { WorkOrder } from '../../types/record.types.js';
export type DoGetWorkdayReportResponse = {
    workOrders: WorkOrder[];
};
export default function handler(request: Request<unknown, unknown, {
    workdayDateString: DateString;
}>, response: Response<DoGetWorkdayReportResponse>): Promise<void>;
