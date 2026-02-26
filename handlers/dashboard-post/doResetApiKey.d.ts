import type { Request, Response } from 'express';
export type DoResetApiKeyResponse = {
    success: true;
    apiKey: string;
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request, response: Response<DoResetApiKeyResponse>): void;
