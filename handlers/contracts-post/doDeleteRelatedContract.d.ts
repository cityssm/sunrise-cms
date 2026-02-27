import type { Request, Response } from 'express';
import { type DeleteRelatedContractForm } from '../../database/deleteRelatedContract.js';
import type { Contract } from '../../types/record.types.js';
export type DoDeleteRelatedContractResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    relatedContracts: Contract[];
};
export default function handler(request: Request<unknown, unknown, DeleteRelatedContractForm>, response: Response<DoDeleteRelatedContractResponse>): Promise<void>;
