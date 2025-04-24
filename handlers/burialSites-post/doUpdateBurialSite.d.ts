import type { Request, Response } from 'express';
import { type UpdateBurialSiteForm } from '../../database/updateBurialSite.js';
export default function handler(request: Request<unknown, unknown, UpdateBurialSiteForm>, response: Response): void;
