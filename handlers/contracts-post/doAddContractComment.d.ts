import type { Request, Response } from 'express';
import { type AddContractCommentForm } from '../../database/addContractComment.js';
export default function handler(request: Request<unknown, unknown, AddContractCommentForm>, response: Response): void;
