import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoAddFeeResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    feeCategories: FeeCategory[];
    feeId: number;
};
export default function handler(request: Request, response: Response<DoAddFeeResponse>): void;
