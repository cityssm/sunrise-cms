import type { Request, Response } from 'express';
import type { Contract } from '../../types/record.types.js';
export type DoDeleteWorkOrderContractResponse = {
    success: boolean;
    workOrderContracts: Contract[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, {
    contractId: string;
    workOrderId: string;
}>, response: Response<DoDeleteWorkOrderContractResponse>): Promise<void>;
