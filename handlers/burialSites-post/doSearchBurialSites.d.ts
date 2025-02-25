import type { Request, Response } from 'express';
import { type GetBurialSitesFilters, type GetBurialSitesOptions } from '../../database/getBurialSites.js';
export default function handler(request: Request<unknown, unknown, GetBurialSitesFilters & GetBurialSitesOptions>, response: Response): Promise<void>;
