import type { Request, Response } from 'express';
import { type AddContractTypeFieldForm } from '../../database/addContractTypeField.js';
export default function handler(request: Request<unknown, unknown, AddContractTypeFieldForm>, response: Response): Promise<void>;
