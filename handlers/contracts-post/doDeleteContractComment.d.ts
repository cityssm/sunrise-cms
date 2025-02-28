import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    contractCommentId: string;
    contractId: string;
}>, response: Response): Promise<void>;
