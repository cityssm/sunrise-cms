import type { Request, Response } from 'express';
import { type AddBurialSiteForm } from '../../database/addBurialSite.js';
export type DoCreateBurialSiteResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    burialSiteId: number;
    burialSiteName: string;
};
export default function handler(request: Request<unknown, unknown, AddBurialSiteForm>, response: Response<DoCreateBurialSiteResponse>): void;
