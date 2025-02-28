import type { Request, Response } from 'express';
import { type AddContractFeeForm } from '../../database/addContractFee.js';
export default function handler(request: Request<unknown, unknown, AddContractFeeForm>, response: Response): Promise<void>;
