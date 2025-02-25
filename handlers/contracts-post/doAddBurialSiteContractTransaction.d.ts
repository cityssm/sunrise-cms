import type { Request, Response } from 'express';
import { type AddTransactionForm } from '../../database/addBurialSiteContractTransaction.js';
export default function handler(request: Request<unknown, unknown, AddTransactionForm>, response: Response): Promise<void>;
