import type { Request, Response } from 'express';
import { type GetBurialSitesFilters } from '../../database/getBurialSites.js';
import type { BurialSite } from '../../types/record.types.js';
export type DoSearchBurialSitesForGpsResponse = {
    burialSites: Array<BurialSite & {
        deceasedNames: string[];
    }>;
    success: true;
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, GetBurialSitesFilters>, response: Response<DoSearchBurialSitesForGpsResponse>): void;
