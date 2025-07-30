import type { Request, Response } from 'express';
export default function handler(request: Request<{
    attachmentId: string;
}>, response: Response): void;
