import type { Request, Response } from 'express';
import { type UpdateForm } from '../../database/updateContractComment.js';
import type { ContractComment } from '../../types/record.types.js';
export type DoUpdateContractCommentResponse = {
    success: boolean;
    contractComments: ContractComment[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, UpdateForm & {
    contractId: string;
}>, response: Response<DoUpdateContractCommentResponse>): void;
