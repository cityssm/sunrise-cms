import type { Request, Response } from 'express';
import { type UpdateCemeteryForm } from '../../database/updateCemetery.js';
export type DoUpdateCemeteryResponse = {
    success: boolean;
    cemeteryId: number | string;
};
export default function handler(request: Request<unknown, unknown, UpdateCemeteryForm>, response: Response<DoUpdateCemeteryResponse>): void;
