import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    funeralHomeId: string | number;
}>, response: Response): Promise<void>;
