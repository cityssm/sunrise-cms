import type { Request, Response } from 'express';
import type { Contract } from '../../types/record.types.js';
export type DoAddWorkOrderContractResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    workOrderContracts: Contract[];
};
export default function handler(request: Request<unknown, unknown, {
    contractId: string;
    workOrderId: string;
}>, response: Response<DoAddWorkOrderContractResponse>): Promise<void>;
