import type { Request, Response } from 'express';
import type { WorkOrderType } from '../../types/record.types.js';
export type DoMoveWorkOrderTypeUpResponse = {
    success: boolean;
    workOrderTypes: WorkOrderType[];
};
export default function handler(request: Request<unknown, unknown, {
    workOrderTypeId: string;
    moveToEnd: '0' | '1';
}>, response: Response<DoMoveWorkOrderTypeUpResponse>): void;
