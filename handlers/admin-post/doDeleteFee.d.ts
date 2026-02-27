import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoDeleteFeeResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    feeCategories: FeeCategory[];
};
export default function handler(request: Request<unknown, unknown, {
    feeId: string;
}>, response: Response<DoDeleteFeeResponse>): void;
