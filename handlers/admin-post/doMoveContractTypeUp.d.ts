import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    contractTypeId: string;
    moveToEnd: '0' | '1';
}>, response: Response): void;
