import type { Request, Response } from 'express';
import { type AddForm } from '../../database/addContractInterment.js';
import type { ContractInterment } from '../../types/record.types.js';
export type DoAddContractIntermentResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    contractInterments: ContractInterment[];
};
export default function handler(request: Request<unknown, unknown, AddForm>, response: Response<DoAddContractIntermentResponse>): void;
