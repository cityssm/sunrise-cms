import type { Request, Response } from 'express';
import { type AddRelatedContractForm } from '../../database/addRelatedContract.js';
import type { Contract } from '../../types/record.types.js';
export type DoAddRelatedContractResponse = {
    errorMessage: string;
    success: false;
} | {
    success: true;
    relatedContracts: Contract[];
};
export default function handler(request: Request<unknown, unknown, AddRelatedContractForm>, response: Response<DoAddRelatedContractResponse>): Promise<void>;
