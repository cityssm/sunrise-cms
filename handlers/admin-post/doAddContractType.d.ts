import type { Request, Response } from 'express';
import { type AddForm } from '../../database/addContractType.js';
import type { ContractType, ContractTypeField } from '../../types/record.types.js';
export type DoAddContractTypeResponse = {
    success: true;
    allContractTypeFields: ContractTypeField[];
    contractTypeId: number;
    contractTypes: ContractType[];
};
export default function handler(request: Request<unknown, unknown, AddForm>, response: Response<DoAddContractTypeResponse>): void;
