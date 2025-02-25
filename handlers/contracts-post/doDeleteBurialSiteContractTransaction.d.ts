import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    burialSiteContractId: string;
    transactionIndex: number;
}>, response: Response): Promise<void>;
