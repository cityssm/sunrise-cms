import type { Request, Response } from 'express';
import { type AddBurialSiteTypeForm } from '../../database/addBurialSiteType.js';
export default function handler(request: Request<unknown, unknown, AddBurialSiteTypeForm>, response: Response): void;
