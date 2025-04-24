import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    workOrderCommentId: string;
    workOrderId: string;
}>, response: Response): void;
