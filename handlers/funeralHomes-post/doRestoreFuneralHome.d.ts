import type { Request, Response } from 'express';
export type DoRestoreFuneralHomeResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    funeralHomeId: number;
};
export default function handler(request: Request<unknown, unknown, {
    funeralHomeId: number;
}>, response: Response<DoRestoreFuneralHomeResponse>): void;
