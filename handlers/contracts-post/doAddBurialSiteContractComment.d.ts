import type { Request, Response } from 'express';
import { type AddBurialSiteContractCommentForm } from '../../database/addBurialSiteContractComment.js';
export default function handler(request: Request<unknown, unknown, AddBurialSiteContractCommentForm>, response: Response): Promise<void>;
