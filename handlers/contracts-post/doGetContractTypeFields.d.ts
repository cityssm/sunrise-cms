import type { Request, Response } from 'express';
import type { ContractTypeField } from '../../types/record.types.js';
export type DoGetContractTypeFieldsResponse = {
    contractTypeFields: ContractTypeField[];
};
export default function handler(request: Request<unknown, unknown, {
    contractTypeId: string;
}>, response: Response<DoGetContractTypeFieldsResponse>): void;
