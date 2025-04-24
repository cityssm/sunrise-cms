import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    workOrderTypeId: string;
}>, response: Response): void;
