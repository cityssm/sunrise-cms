import type { Request, Response } from 'express';
import { type AddBurialSiteForm } from '../../database/addBurialSite.js';
export default function handler(request: Request<unknown, unknown, AddBurialSiteForm>, response: Response): void;
