import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoUpdateFeeCategoryResponse = {
    success: boolean;
    feeCategories: FeeCategory[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request, response: Response<DoUpdateFeeCategoryResponse>): void;
