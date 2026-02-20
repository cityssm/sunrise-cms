import type { Request, Response } from 'express';
import { type UpdateIntermentDepthForm } from '../../database/updateIntermentDepth.js';
export default function handler(request: Request<unknown, unknown, UpdateIntermentDepthForm>, response: Response): void;
