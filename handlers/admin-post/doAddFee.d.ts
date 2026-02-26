import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoAddFeeResponse = {
    success: true;
    feeCategories: FeeCategory[];
    feeId: number;
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request, response: Response<DoAddFeeResponse>): void;
