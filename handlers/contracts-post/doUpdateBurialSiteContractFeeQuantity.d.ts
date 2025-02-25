import type { Request, Response } from 'express';
import { type UpdateBurialSiteFeeForm } from '../../database/updateBurialSiteContractFeeQuantity.js';
export default function handler(request: Request<unknown, unknown, UpdateBurialSiteFeeForm>, response: Response): Promise<void>;
