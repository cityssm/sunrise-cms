import type { Request, Response } from 'express';
import { type AddRelatedContractForm } from '../../database/addRelatedContract.js';
export default function handler(request: Request<unknown, unknown, AddRelatedContractForm>, response: Response): Promise<void>;
