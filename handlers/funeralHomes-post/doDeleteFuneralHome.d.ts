import type { Request, Response } from 'express';
export type DoDeleteFuneralHomeResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
};
export default function handler(request: Request<unknown, unknown, {
    funeralHomeId: number | string;
}>, response: Response<DoDeleteFuneralHomeResponse>): void;
