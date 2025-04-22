import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, unknown, {
    tab?: string;
}>, response: Response): Promise<void>;
