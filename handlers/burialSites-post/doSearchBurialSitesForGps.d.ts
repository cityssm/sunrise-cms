import type { Request, Response } from 'express';
import { type GetBurialSitesFilters } from '../../database/getBurialSites.js';
export default function handler(request: Request<unknown, unknown, GetBurialSitesFilters>, response: Response): void;
