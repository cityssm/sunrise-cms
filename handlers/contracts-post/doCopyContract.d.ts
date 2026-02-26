import type { Request, Response } from 'express';
export type DoCopyContractResponse = {
    success: true;
    contractId: number;
};
export default function handler(request: Request<unknown, unknown, {
    contractId: string;
}>, response: Response<DoCopyContractResponse>): Promise<void>;
