import type { Request, Response } from 'express';
export type DoUpdateUserResponse = {
    message: string;
    success: true;
} | {
    message: string;
    success: false;
};
export default function handler(request: Request, response: Response<DoUpdateUserResponse>): void;
