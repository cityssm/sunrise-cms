import type { Request, Response } from 'express';
import type { ContractFee } from '../../types/record.types.js';
export type DoDeleteContractFeeResponse = {
    errorMessage: string;
    success: false;
} | {
    success: boolean;
    contractFees: ContractFee[];
    errorMessage: string;
};
export default function handler(request: Request<unknown, unknown, {
    contractId: string;
    feeId: string;
}>, response: Response<DoDeleteContractFeeResponse>): void;
