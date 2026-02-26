import type { Request, Response } from 'express';
import { type GetContractsFilters, type GetContractsOptions } from '../../database/getContracts.js';
import type { Contract } from '../../types/record.types.js';
export type DoGetPossibleRelatedContractsResponse = {
    contracts: Contract[];
    count: number;
    offset: number;
};
export default function handler(request: Request<unknown, unknown, GetContractsFilters & GetContractsOptions>, response: Response<DoGetPossibleRelatedContractsResponse>): Promise<void>;
