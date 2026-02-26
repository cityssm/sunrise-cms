import type { Request, Response } from 'express';
import { type UpdateContractTypeFieldForm } from '../../database/updateContractTypeField.js';
import type { ContractType, ContractTypeField } from '../../types/record.types.js';
export type DoUpdateContractTypeFieldResponse = {
    success: boolean;
    allContractTypeFields: ContractTypeField[];
    contractTypes: ContractType[];
};
export default function handler(request: Request<unknown, unknown, UpdateContractTypeFieldForm>, response: Response<DoUpdateContractTypeFieldResponse>): void;
