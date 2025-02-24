import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    contractTypeId: string;
}>, response: Response): Promise<void>;
