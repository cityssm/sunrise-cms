import type { Request, Response } from 'express';
import { type AddContractCategoryForm } from '../../database/addContractFeeCategory.js';
import type { ContractFee } from '../../types/record.types.js';
export type DoAddContractFeeCategoryResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    contractFees: ContractFee[];
};
export default function handler(request: Request<unknown, unknown, AddContractCategoryForm>, response: Response<DoAddContractFeeCategoryResponse>): Promise<void>;
