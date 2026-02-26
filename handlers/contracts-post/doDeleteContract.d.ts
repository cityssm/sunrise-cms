import type { Request, Response } from 'express';
export type DoDeleteContractResponse = {
    success: boolean;
    errorMessage: string;
};
export default function handler(request: Request<unknown, unknown, {
    contractId: string;
}>, response: Response<DoDeleteContractResponse>): void;
