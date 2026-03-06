import type { Request, Response } from 'express';
export type DoRestoreFuneralHomeResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    funeralHomeId: number;
};
export default function handler(request: Request<unknown, unknown, {
    funeralHomeId: number;
}>, response: Response<DoRestoreFuneralHomeResponse>): void;
