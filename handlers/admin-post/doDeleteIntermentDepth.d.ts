import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    intermentDepthId: string;
}>, response: Response): void;
