import type { Request, Response } from 'express';
import { type AddContractCommentForm } from '../../database/addContractComment.js';
import type { ContractComment } from '../../types/record.types.js';
export type DoAddContractCommentResponse = {
    success: true;
    contractComments: ContractComment[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, AddContractCommentForm>, response: Response<DoAddContractCommentResponse>): void;
