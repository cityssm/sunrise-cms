import type { Request, Response } from 'express';
import { type UpdateContractForm } from '../../database/updateContract.js';
export default function handler(request: Request<unknown, unknown, UpdateContractForm>, response: Response): Promise<void>;
