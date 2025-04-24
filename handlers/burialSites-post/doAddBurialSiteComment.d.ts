import type { Request, Response } from 'express';
import { type AddBurialSiteCommentForm } from '../../database/addBurialSiteComment.js';
export default function handler(request: Request<unknown, unknown, AddBurialSiteCommentForm>, response: Response): void;
