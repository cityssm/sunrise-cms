import type { Request, Response } from 'express';
import { type UpdateBurialSiteForm } from '../../database/updateBurialSite.js';
export type DoUpdateBurialSiteResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    burialSiteId: number;
};
export default function handler(request: Request<unknown, unknown, UpdateBurialSiteForm>, response: Response<DoUpdateBurialSiteResponse>): void;
