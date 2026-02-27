import type { Request, Response } from 'express';
import { type UpdateBurialSiteFeeForm } from '../../database/updateContractFeeQuantity.js';
import type { ContractFee } from '../../types/record.types.js';
export type DoUpdateContractFeeQuantityResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    contractFees: ContractFee[];
};
export default function handler(request: Request<unknown, unknown, UpdateBurialSiteFeeForm>, response: Response<DoUpdateContractFeeQuantityResponse>): void;
