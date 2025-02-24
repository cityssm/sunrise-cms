import type { Request, Response } from 'express';
import { type AddCemeteryForm } from '../../database/addCemetery.js';
export default function handler(request: Request<unknown, unknown, AddCemeteryForm>, response: Response): Promise<void>;
