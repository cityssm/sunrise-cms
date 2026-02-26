import type { Request, Response } from 'express';
import type { ContractFee } from '../../types/record.types.js';
export type DoDeleteContractFeeResponse = {
    success: boolean;
    contractFees: ContractFee[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    contractId: string;
    feeId: string;
}>, response: Response<DoDeleteContractFeeResponse>): void;
