import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoDeleteFeeCategoryResponse = {
    success: boolean;
    feeCategories: FeeCategory[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    feeCategoryId: string;
}>, response: Response<DoDeleteFeeCategoryResponse>): void;
