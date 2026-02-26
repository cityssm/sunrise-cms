import type { Request, Response } from 'express';
import type { WorkOrderType } from '../../types/record.types.js';
export type DoUpdateWorkOrderTypeResponse = {
    success: boolean;
    workOrderTypes: WorkOrderType[];
};
export default function handler(request: Request<unknown, unknown, {
    workOrderTypeId: string;
    workOrderType: string;
}>, response: Response<DoUpdateWorkOrderTypeResponse>): void;
