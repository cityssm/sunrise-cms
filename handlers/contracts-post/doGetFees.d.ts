import type { Request, Response } from 'express';
import type { FeeCategory } from '../../types/record.types.js';
export type DoGetFeesResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    feeCategories: FeeCategory[];
};
export default function handler(request: Request<unknown, unknown, {
    contractId: string;
}>, response: Response<DoGetFeesResponse>): Promise<void>;
