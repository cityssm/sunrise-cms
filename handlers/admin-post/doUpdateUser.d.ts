import type { Request, Response } from 'express';
export type DoUpdateUserResponse = {
    message: string;
    success: boolean;
};
export default function handler(request: Request, response: Response<DoUpdateUserResponse>): void;
