import type { Request, Response } from 'express';
import { type AddForm } from '../../database/addContractInterment.js';
export default function handler(request: Request<unknown, unknown, AddForm>, response: Response): Promise<void>;
