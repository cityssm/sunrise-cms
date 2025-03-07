import type { Request, Response } from 'express';
import { type UpdateForm } from '../../database/updateContractInterment.js';
export default function handler(request: Request<unknown, unknown, UpdateForm>, response: Response): Promise<void>;
