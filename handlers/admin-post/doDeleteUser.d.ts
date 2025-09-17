import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    userName: string;
}>, response: Response): void;
