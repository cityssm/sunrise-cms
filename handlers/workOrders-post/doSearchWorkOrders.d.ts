import type { Request, Response } from 'express';
import { type GetWorkOrdersFilters, type GetWorkOrdersOptions } from '../../database/getWorkOrders.js';
import type { WorkOrder } from '../../types/record.types.js';
export type DoSearchWorkOrdersResponse = {
    count: number;
    offset: number;
    workOrders: WorkOrder[];
};
export default function handler(request: Request<unknown, unknown, GetWorkOrdersFilters & GetWorkOrdersOptions>, response: Response<DoSearchWorkOrdersResponse>): Promise<void>;
