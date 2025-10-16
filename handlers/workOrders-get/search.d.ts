import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, unknown, {
    error?: string;
    workOrderOpenDateString?: string;
}>, response: Response): void;
