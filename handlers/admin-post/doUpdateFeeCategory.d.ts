import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoUpdateFeeCategoryResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    feeCategories: FeeCategory[];
};
export default function handler(request: Request, response: Response<DoUpdateFeeCategoryResponse>): void;
