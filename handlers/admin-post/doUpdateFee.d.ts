import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoUpdateFeeResponse = {
    errorMessage: string;
    success: false;
} | {
    success: boolean;
    feeCategories: FeeCategory[];
    errorMessage: string;
};
export default function handler(request: Request, response: Response<DoUpdateFeeResponse>): void;
