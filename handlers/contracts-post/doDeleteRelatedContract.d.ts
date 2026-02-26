import type { Request, Response } from 'express';
import { type DeleteRelatedContractForm } from '../../database/deleteRelatedContract.js';
import type { Contract } from '../../types/record.types.js';
export type DoDeleteRelatedContractResponse = {
    success: true;
    relatedContracts: Contract[];
} | {
    errorMessage: string;
    success: false;
};
export default function handler(request: Request<unknown, unknown, DeleteRelatedContractForm>, response: Response<DoDeleteRelatedContractResponse>): Promise<void>;
