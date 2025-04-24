import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    workOrderTypeId: string;
    workOrderType: string;
}>, response: Response): void;
