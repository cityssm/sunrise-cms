import type { Request, Response } from 'express';
import { type AddContractCommentForm } from '../../database/addContractComment.js';
import type { ContractComment } from '../../types/record.types.js';
export type DoAddContractCommentResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    contractComments: ContractComment[];
};
export default function handler(request: Request<unknown, unknown, AddContractCommentForm>, response: Response<DoAddContractCommentResponse>): void;
