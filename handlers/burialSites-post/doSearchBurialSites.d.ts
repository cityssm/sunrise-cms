import type { Request, Response } from 'express';
import { type GetBurialSitesFilters, type GetBurialSitesOptions } from '../../database/getBurialSites.js';
import type { BurialSite } from '../../types/record.types.js';
export type DoSearchBurialSitesResponse = {
    burialSites: BurialSite[];
    count: number;
    offset: number;
};
export default function handler(request: Request<unknown, unknown, GetBurialSitesFilters & GetBurialSitesOptions>, response: Response<DoSearchBurialSitesResponse>): void;
