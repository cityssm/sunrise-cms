import type { Request, Response } from 'express';
import { type AddContractTypePrintForm } from '../../database/addContractTypePrint.js';
import type { ContractType, ContractTypeField } from '../../types/record.types.js';
export type DoAddContractTypePrintResponse = {
    success: boolean;
    allContractTypeFields: ContractTypeField[];
    contractTypes: ContractType[];
};
export default function handler(request: Request<unknown, unknown, AddContractTypePrintForm>, response: Response<DoAddContractTypePrintResponse>): void;
