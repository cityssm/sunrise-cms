import type { Request, Response } from 'express';
export default function handler(request: Request<{
    funeralHomeId: string;
}>, response: Response): void;
