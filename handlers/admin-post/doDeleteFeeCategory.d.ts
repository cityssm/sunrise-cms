import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoDeleteFeeCategoryResponse = {
    errorMessage: string;
    success: false;
} | {
    success: boolean;
    feeCategories: FeeCategory[];
    errorMessage: string;
};
export default function handler(request: Request<unknown, unknown, {
    feeCategoryId: string;
}>, response: Response<DoDeleteFeeCategoryResponse>): void;
