import type { Request, Response } from 'express';
import { type GetBurialSiteNamesByRangeForm } from '../../database/getBurialSiteNamesByRange.js';
export default function handler(request: Request<unknown, unknown, GetBurialSiteNamesByRangeForm>, response: Response): void;
