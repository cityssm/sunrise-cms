import type { Request, Response } from 'express';
import { type ContractTransactionUpdateForm } from '../../database/updateContractTransaction.js';
import type { ContractTransaction } from '../../types/record.types.js';
export type DoUpdateContractTransactionResponse = {
    success: true;
    contractTransactions: ContractTransaction[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, ContractTransactionUpdateForm>, response: Response<DoUpdateContractTransactionResponse>): Promise<void>;
