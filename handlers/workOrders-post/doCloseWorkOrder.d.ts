import type { Request, Response } from 'express';
import { type CloseWorkOrderForm } from '../../database/closeWorkOrder.js';
export type DoCloseWorkOrderResponse = {
    success: boolean;
    workOrderId: number | undefined;
};
export default function handler(request: Request<unknown, unknown, CloseWorkOrderForm>, response: Response<DoCloseWorkOrderResponse>): void;
