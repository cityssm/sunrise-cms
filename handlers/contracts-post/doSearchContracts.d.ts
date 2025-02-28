import type { Request, Response } from 'express';
import { type GetContractsFilters, type GetContractsOptions } from '../../database/getContracts.js';
export default function handler(request: Request<unknown, unknown, GetContractsFilters & GetContractsOptions>, response: Response): Promise<void>;
