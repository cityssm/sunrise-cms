import type { Request, Response } from 'express';
import { type AddBurialSiteContractForm } from '../../database/addBurialSiteContract.js';
export default function handler(request: Request<unknown, unknown, AddBurialSiteContractForm>, response: Response): Promise<void>;
