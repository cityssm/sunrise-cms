import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoGetFeesResponse = {
    feeCategories: FeeCategory[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    contractId: string;
}>, response: Response<DoGetFeesResponse>): Promise<void>;
