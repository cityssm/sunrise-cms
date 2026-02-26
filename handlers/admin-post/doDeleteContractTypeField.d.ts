import type { Request, Response } from 'express';
import type { ContractType, ContractTypeField } from '../../types/record.types.js';
export type DoDeleteContractTypeFieldResponse = {
    success: boolean;
    allContractTypeFields: ContractTypeField[];
    contractTypes: ContractType[];
};
export default function handler(request: Request<unknown, unknown, {
    contractTypeFieldId: string;
}>, response: Response<DoDeleteContractTypeFieldResponse>): void;
