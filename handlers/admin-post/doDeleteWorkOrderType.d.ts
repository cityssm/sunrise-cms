import type { Request, Response } from 'express';
import type { WorkOrderType } from '../../types/record.types.js';
export type DoDeleteWorkOrderTypeResponse = {
    success: boolean;
    workOrderTypes: WorkOrderType[];
};
export default function handler(request: Request<unknown, unknown, {
    workOrderTypeId: string;
}>, response: Response<DoDeleteWorkOrderTypeResponse>): void;
