import type { Request, Response } from 'express';
import { type UpdateForm } from '../../database/updateContractInterment.js';
import type { ContractInterment } from '../../types/record.types.js';
export type DoUpdateContractIntermentResponse = {
    success: true;
    contractInterments: ContractInterment[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, UpdateForm>, response: Response<DoUpdateContractIntermentResponse>): void;
