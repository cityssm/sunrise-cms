import type { Request, Response } from 'express';
import { type AddBurialSiteForm } from '../../database/addBurialSite.js';
export type DoCreateBurialSiteResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    burialSiteId: number;
    burialSiteName: string;
};
export default function handler(request: Request<unknown, unknown, AddBurialSiteForm>, response: Response<DoCreateBurialSiteResponse>): void;
