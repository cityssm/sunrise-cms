import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoAddFeeCategoryResponse = {
    success: true;
    feeCategories: FeeCategory[];
    feeCategoryId: number;
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request, response: Response<DoAddFeeCategoryResponse>): void;
