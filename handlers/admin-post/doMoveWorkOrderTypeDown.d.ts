import type { Request, Response } from 'express';
import type { WorkOrderType } from '../../types/record.types.js';
export type DoMoveWorkOrderTypeDownResponse = {
    success: boolean;
    workOrderTypes: WorkOrderType[];
};
export default function handler(request: Request<unknown, unknown, {
    workOrderTypeId: string;
    moveToEnd: '0' | '1';
}>, response: Response<DoMoveWorkOrderTypeDownResponse>): void;
