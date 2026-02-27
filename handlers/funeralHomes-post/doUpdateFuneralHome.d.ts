import type { Request, Response } from 'express';
import { type UpdateForm } from '../../database/updateFuneralHome.js';
export type DoUpdateFuneralHomeResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    funeralHomeId: number | string;
};
export default function handler(request: Request<unknown, unknown, UpdateForm>, response: Response<DoUpdateFuneralHomeResponse>): void;
