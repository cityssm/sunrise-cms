import type { Request, Response } from 'express';
import { type DeleteRelatedContractForm } from '../../database/deleteRelatedContract.js';
export default function handler(request: Request<unknown, unknown, DeleteRelatedContractForm>, response: Response): Promise<void>;
