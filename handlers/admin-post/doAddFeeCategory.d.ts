import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoAddFeeCategoryResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    feeCategories: FeeCategory[];
    feeCategoryId: number;
};
export default function handler(request: Request, response: Response<DoAddFeeCategoryResponse>): void;
