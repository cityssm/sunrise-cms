import type { Request, Response } from 'express';
import { type AddBurialSiteContractFeeForm } from '../../database/addBurialSiteContractFee.js';
export default function handler(request: Request<unknown, unknown, AddBurialSiteContractFeeForm>, response: Response): Promise<void>;
