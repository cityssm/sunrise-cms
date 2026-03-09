import type { Request, Response } from 'express';
export type DoCreateWorkOrderResponse = {
    workOrderId: number;
};
export default function handler(request: Request, response: Response<DoCreateWorkOrderResponse>): void;
