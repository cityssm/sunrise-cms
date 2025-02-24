import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    lotTypeFieldId: string;
}>, response: Response): Promise<void>;
