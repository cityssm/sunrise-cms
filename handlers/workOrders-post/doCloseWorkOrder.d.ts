import type { Request, Response } from 'express';
import { type CloseWorkOrderForm } from '../../database/closeWorkOrder.js';
export type DoCloseWorkOrderResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    workOrderId: number | undefined;
};
export default function handler(request: Request<unknown, unknown, CloseWorkOrderForm>, response: Response<DoCloseWorkOrderResponse>): void;
