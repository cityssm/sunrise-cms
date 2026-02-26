import type { Request, Response } from 'express';
export type DoCreateWorkOrderResponse = {
    success: true;
    workOrderId: number;
};
export default function handler(request: Request, response: Response<DoCreateWorkOrderResponse>): void;
