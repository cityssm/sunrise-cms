import type { Request, Response } from 'express';
import { type UpdateForm } from '../../database/updateContractComment.js';
export default function handler(request: Request<unknown, unknown, UpdateForm & {
    contractId: string;
}>, response: Response): Promise<void>;
