import type { Request, Response } from 'express';
import { type AddIntermentDepthForm } from '../../database/addIntermentDepth.js';
export default function handler(request: Request<unknown, unknown, AddIntermentDepthForm>, response: Response): void;
