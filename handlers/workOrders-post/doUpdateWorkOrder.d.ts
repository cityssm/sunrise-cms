import type { Request, Response } from 'express';
import { type UpdateWorkOrderForm } from '../../database/updateWorkOrder.js';
export type DoUpdateWorkOrderResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    workOrderId: number | string;
};
export default function handler(request: Request<unknown, unknown, UpdateWorkOrderForm>, response: Response<DoUpdateWorkOrderResponse>): void;
