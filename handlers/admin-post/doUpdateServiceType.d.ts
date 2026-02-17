import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    serviceTypeId: number | string;
    serviceType: string;
}>, response: Response): void;
