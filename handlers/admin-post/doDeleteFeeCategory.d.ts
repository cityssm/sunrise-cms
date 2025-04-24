import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    feeCategoryId: string;
}>, response: Response): void;
