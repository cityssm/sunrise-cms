import type { Request, Response } from 'express';
import { type AddContractTypePrintForm } from '../../database/addContractTypePrint.js';
export default function handler(request: Request<unknown, unknown, AddContractTypePrintForm>, response: Response): Promise<void>;
