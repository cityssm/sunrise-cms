import type { Request, Response } from 'express';
import { type AddContractTypeFieldForm } from '../../database/addContractTypeField.js';
import type { ContractType, ContractTypeField } from '../../types/record.types.js';
export type DoAddContractTypeFieldResponse = {
    success: true;
    allContractTypeFields: ContractTypeField[];
    contractTypeFieldId: number;
    contractTypes: ContractType[];
};
export default function handler(request: Request<unknown, unknown, AddContractTypeFieldForm>, response: Response<DoAddContractTypeFieldResponse>): void;
