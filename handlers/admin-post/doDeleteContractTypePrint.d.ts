import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    contractTypeId: string;
    printEJS: string;
}>, response: Response): void;
