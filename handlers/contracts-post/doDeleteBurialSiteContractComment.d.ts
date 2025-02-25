import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    burialSiteContractCommentId: string;
    burialSiteContractId: string;
}>, response: Response): Promise<void>;
