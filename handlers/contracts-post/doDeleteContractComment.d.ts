import type { Request, Response } from 'express';
import type { ContractComment } from '../../types/record.types.js';
export type DoDeleteContractCommentResponse = {
    errorMessage: string;
    success: false;
} | {
    success: boolean;
    contractComments: ContractComment[];
    errorMessage: string;
};
export default function handler(request: Request<unknown, unknown, {
    contractCommentId: string;
    contractId: string;
}>, response: Response<DoDeleteContractCommentResponse>): void;
