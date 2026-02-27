import type { Request, Response } from 'express';
import { type UpdateForm } from '../../database/updateContractComment.js';
import type { ContractComment } from '../../types/record.types.js';
export type DoUpdateContractCommentResponse = {
    errorMessage: string;
    success: false;
} | {
    success: boolean;
    contractComments: ContractComment[];
    errorMessage: string;
};
export default function handler(request: Request<unknown, unknown, UpdateForm & {
    contractId: string;
}>, response: Response<DoUpdateContractCommentResponse>): void;
