import type { Request, Response } from 'express';
import { type ContractTransactionUpdateForm } from '../../database/updateContractTransaction.js';
export default function handler(request: Request<unknown, unknown, ContractTransactionUpdateForm>, response: Response): Promise<void>;
