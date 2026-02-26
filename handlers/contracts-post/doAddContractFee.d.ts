import type { Request, Response } from 'express';
import { type AddContractFeeForm } from '../../database/addContractFee.js';
import type { ContractFee } from '../../types/record.types.js';
export type DoAddContractFeeResponse = {
    success: true;
    contractFees: ContractFee[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, AddContractFeeForm>, response: Response<DoAddContractFeeResponse>): Promise<void>;
