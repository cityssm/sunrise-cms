import type { Request, Response } from 'express';
export type DoDeleteContractResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
};
export default function handler(request: Request<unknown, unknown, {
    contractId: string;
}>, response: Response<DoDeleteContractResponse>): void;
