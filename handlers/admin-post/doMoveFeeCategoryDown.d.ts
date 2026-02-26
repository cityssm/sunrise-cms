import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoMoveFeeCategoryDownResponse = {
    success: boolean;
    feeCategories: FeeCategory[];
};
export default function handler(request: Request<unknown, unknown, {
    feeCategoryId: string;
    moveToEnd: '0' | '1';
}>, response: Response<DoMoveFeeCategoryDownResponse>): void;
