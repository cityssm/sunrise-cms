import type { Request, Response } from 'express';
export type DoResetApiKeyResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    apiKey: string;
};
export default function handler(request: Request, response: Response<DoResetApiKeyResponse>): void;
