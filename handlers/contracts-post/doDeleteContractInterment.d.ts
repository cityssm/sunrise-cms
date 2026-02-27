import type { Request, Response } from 'express';
import type { ContractInterment } from '../../types/record.types.js';
export type DoDeleteContractIntermentResponse = {
    errorMessage: string;
    success: false;
} | {
    success: boolean;
    contractInterments: ContractInterment[];
};
export default function handler(request: Request<unknown, unknown, {
    contractId: string;
    intermentNumber: string;
}>, response: Response<DoDeleteContractIntermentResponse>): void;
