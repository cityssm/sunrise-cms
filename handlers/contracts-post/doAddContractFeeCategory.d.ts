import type { Request, Response } from 'express';
import { type AddContractCategoryForm } from '../../database/addContractFeeCategory.js';
export default function handler(request: Request<unknown, unknown, AddContractCategoryForm>, response: Response): Promise<void>;
