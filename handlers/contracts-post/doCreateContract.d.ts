import type { Request, Response } from 'express';
import { type AddContractForm } from '../../database/addContract.js';
export type DoCreateContractResponse = {
    contractId: number;
};
export default function handler(request: Request<unknown, unknown, AddContractForm>, response: Response<DoCreateContractResponse>): void;
