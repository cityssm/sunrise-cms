import type { Request, Response } from 'express';
import type { ContractInterment } from '../../types/record.types.js';
export type DoDeleteContractIntermentResponse = {
    success: boolean;
    contractInterments: ContractInterment[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    contractId: string;
    intermentNumber: string;
}>, response: Response<DoDeleteContractIntermentResponse>): void;
