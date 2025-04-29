import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    intermentContainerTypeId: string;
}>, response: Response): void;
