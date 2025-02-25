import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    burialSiteContractId: string;
}>, response: Response): Promise<void>;
