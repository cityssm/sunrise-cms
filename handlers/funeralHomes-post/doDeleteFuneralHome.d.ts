import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    funeralHomeId: number | string;
}>, response: Response): Promise<void>;
