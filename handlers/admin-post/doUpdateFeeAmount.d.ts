import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoUpdateFeeAmountResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    feeCategories: FeeCategory[];
};
export default function handler(request: Request, response: Response<DoUpdateFeeAmountResponse>): void;
