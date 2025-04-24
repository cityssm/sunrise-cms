import type { Request, Response } from 'express';
import { type UpdateCemeteryForm } from '../../database/updateCemetery.js';
export default function handler(request: Request<unknown, unknown, UpdateCemeteryForm>, response: Response): void;
