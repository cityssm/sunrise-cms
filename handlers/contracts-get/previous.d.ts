import type { Request, Response } from 'express';
export default function handler(request: Request<{
    contractId: string;
}>, response: Response): void;
