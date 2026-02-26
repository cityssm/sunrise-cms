import type { Request, Response } from 'express';
import { type UpdateBurialSiteForm } from '../../database/updateBurialSite.js';
export type DoUpdateBurialSiteResponse = {
    success: boolean;
    burialSiteId: number;
} | {
    success: false;
    errorMessage: string;
};
export default function handler(request: Request<unknown, unknown, UpdateBurialSiteForm>, response: Response<DoUpdateBurialSiteResponse>): void;
