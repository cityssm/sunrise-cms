import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    feeId: string;
}>, response: Response): void;
