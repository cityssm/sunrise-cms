import type { Request, Response } from 'express';
import { type AddBurialSiteContractCategoryForm } from '../../database/addBurialSiteContractFeeCategory.js';
export default function handler(request: Request<unknown, unknown, AddBurialSiteContractCategoryForm>, response: Response): Promise<void>;
