import type { Request, Response } from 'express';
export type DoDeleteWorkOrderResponse = {
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    workOrderId: string;
}>, response: Response<DoDeleteWorkOrderResponse>): void;
