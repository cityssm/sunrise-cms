import type { Request, Response } from 'express';
import { type UpdateForm } from '../../database/updateBurialSiteContractComment.js';
export default function handler(request: Request<unknown, unknown, UpdateForm & {
    burialSiteContractId: string;
}>, response: Response): Promise<void>;
