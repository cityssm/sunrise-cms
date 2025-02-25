import type { Request, Response } from 'express';
import { type UpdateBurialSiteContractForm } from '../../database/updateBurialSiteContract.js';
export default function handler(request: Request<unknown, unknown, UpdateBurialSiteContractForm>, response: Response): Promise<void>;
