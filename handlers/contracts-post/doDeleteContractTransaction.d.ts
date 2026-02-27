import type { Request, Response } from 'express';
import type { ContractTransaction } from '../../types/record.types.js';
export type DoDeleteContractTransactionResponse = {
    errorMessage: string;
    success: false;
} | {
    success: boolean;
    errorMessage: string;
    contractTransactions: ContractTransaction[];
};
export default function handler(request: Request<unknown, unknown, {
    contractId: string;
    transactionIndex: number;
}>, response: Response<DoDeleteContractTransactionResponse>): Promise<void>;
