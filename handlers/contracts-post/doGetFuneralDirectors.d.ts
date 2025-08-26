import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    funeralHomeId: string;
}>, response: Response): void;
