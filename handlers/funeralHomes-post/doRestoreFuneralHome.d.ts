import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    funeralHomeId: number;
}>, response: Response): void;
