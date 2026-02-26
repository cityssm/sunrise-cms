import type { Request, Response } from 'express';
export type DoDeleteCemeteryResponse = {
    errorMessage: string;
    success: boolean;
};
export default function handler(request: Request<unknown, unknown, {
    cemeteryId: number | string;
}>, response: Response<DoDeleteCemeteryResponse>): void;
