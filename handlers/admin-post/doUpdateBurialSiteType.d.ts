import type { Request, Response } from 'express';
import { type UpdateBurialSiteTypeForm } from '../../database/updateBurialSiteType.js';
export default function handler(request: Request<unknown, unknown, UpdateBurialSiteTypeForm>, response: Response): void;
