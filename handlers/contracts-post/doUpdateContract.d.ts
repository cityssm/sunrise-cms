import type { Request, Response } from 'express';
import { type UpdateContractForm } from '../../database/updateContract.js';
export type DoUpdateContractResponse = {
    success: boolean;
    contractId: number | string;
};
export default function handler(request: Request<unknown, unknown, UpdateContractForm>, response: Response<DoUpdateContractResponse>): void;
