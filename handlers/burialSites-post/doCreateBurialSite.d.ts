import type { Request, Response } from 'express';
import { type AddBurialSiteForm } from '../../database/addBurialSite.js';
export type DoCreateBurialSiteResponse = {
    success: true;
    burialSiteId: number;
    burialSiteName: string;
} | {
    success: false;
    errorMessage: string;
};
export default function handler(request: Request<unknown, unknown, AddBurialSiteForm>, response: Response<DoCreateBurialSiteResponse>): void;
