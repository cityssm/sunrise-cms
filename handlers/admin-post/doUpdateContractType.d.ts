import type { Request, Response } from 'express';
import { type UpdateForm } from '../../database/updateContractType.js';
import type { ContractType, ContractTypeField } from '../../types/record.types.js';
export type DoUpdateContractTypeResponse = {
    success: boolean;
    allContractTypeFields: ContractTypeField[];
    contractTypes: ContractType[];
};
export default function handler(request: Request<unknown, unknown, UpdateForm>, response: Response<DoUpdateContractTypeResponse>): void;
