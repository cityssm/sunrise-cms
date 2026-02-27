import type { Request, Response } from 'express';
import { type AddTransactionForm } from '../../database/addContractTransaction.js';
import type { ContractTransaction } from '../../types/record.types.js';
export type DoAddContractTransactionResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    contractTransactions: ContractTransaction[];
};
export default function handler(request: Request<unknown, unknown, AddTransactionForm>, response: Response<DoAddContractTransactionResponse>): Promise<void>;
