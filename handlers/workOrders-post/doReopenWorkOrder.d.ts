import type { Request, Response } from 'express';
export type DoReopenWorkOrderResponse = {
    success: boolean;
    workOrderId: string;
};
export default function handler(request: Request<unknown, unknown, {
    workOrderId: string;
}>, response: Response<DoReopenWorkOrderResponse>): void;
