import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoMoveFeeUpResponse = {
    success: boolean;
    feeCategories: FeeCategory[];
};
export default function handler(request: Request<unknown, unknown, {
    feeId: string;
    moveToEnd: '0' | '1';
}>, response: Response<DoMoveFeeUpResponse>): void;
