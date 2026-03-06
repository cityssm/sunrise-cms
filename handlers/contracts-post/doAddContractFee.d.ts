import type { Request, Response } from 'express';
import { type AddContractFeeForm } from '../../database/addContractFee.js';
import type { ContractFee } from '../../types/record.types.js';
export type DoAddContractFeeResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    contractFees: ContractFee[];
};
export default function handler(request: Request<unknown, unknown, AddContractFeeForm>, response: Response<DoAddContractFeeResponse>): Promise<void>;
