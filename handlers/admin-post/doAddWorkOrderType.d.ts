import type { Request, Response } from 'express';
import type { WorkOrderType } from '../../types/record.types.js';
export type DoAddWorkOrderTypeResponse = {
    success: true;
    workOrderTypeId: number;
    workOrderTypes: WorkOrderType[];
};
export default function handler(request: Request<unknown, unknown, {
    workOrderType: string;
    orderNumber?: number | string;
}>, response: Response<DoAddWorkOrderTypeResponse>): void;
