import type { Request, Response } from 'express';
import { type BurialSiteContractTransactionUpdateForm } from '../../database/updateBurialSiteContractTransaction.js';
export default function handler(request: Request<unknown, unknown, BurialSiteContractTransactionUpdateForm>, response: Response): Promise<void>;
