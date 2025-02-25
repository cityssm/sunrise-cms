import type { Request, Response } from 'express';
import { type GetBurialSiteContractsFilters, type GetBurialSiteContractsOptions } from '../../database/getBurialSiteContracts.js';
export default function handler(request: Request<unknown, unknown, GetBurialSiteContractsFilters & GetBurialSiteContractsOptions>, response: Response): Promise<void>;
