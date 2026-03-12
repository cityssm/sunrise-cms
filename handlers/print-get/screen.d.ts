import type { Request, Response } from 'express';
export default function handler(request: Request<{
    printName: string;
}>, response: Response): Promise<void>;
