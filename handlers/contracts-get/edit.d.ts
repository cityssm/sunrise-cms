import type { Request, Response } from 'express';
export default function handler(request: Request, response: Response, next: (error?: Error) => void): Promise<void>;
